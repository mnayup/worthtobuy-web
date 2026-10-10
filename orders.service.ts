import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma/prisma.service';
import { FeeService } from '../services/fee.service';
import { StockService } from '../services/stock.service';
import { RefundService } from '../services/refund.service';
import { InvoiceCalcService } from '../services/invoice-calc.service';
import { sequence, decimal } from '../common/utils/http.utils';

function subtotalIdr(items: Array<Record<string, any>>) {
  return items.reduce((sum, item) => sum + Number(item.unitPriceForeign || 0) * Number(item.quantity || 1), 0);
}

function calculateOrderTotals(input: Record<string, any>, items: Array<Record<string, any>>) {
  const productSubtotalIdr = items.reduce(
    (sum, item) => sum + decimal(item.unitPriceForeign) * decimal(item.quantity, 1),
    0,
  );
  const serviceFee = decimal(input.serviceFee);
  const localShipping = decimal(input.localShipping);
  const customerShipping = decimal(input.customerShipping);
  const additionalFee = decimal(input.additionalFee);
  const discount = decimal(input.discount);
  const totalBill = productSubtotalIdr + serviceFee + localShipping + customerShipping + additionalFee - discount;
  const paidAmount = decimal(input.paidAmount);
  return {
    productSubtotalForeign: productSubtotalIdr,
    productSubtotalIdr,
    serviceFee,
    localShipping,
    internationalShipping: 0,
    customerShipping,
    additionalFee,
    discount,
    totalBill,
    paidAmount,
    outstandingAmount: Math.max(0, totalBill - paidAmount),
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private feeService: FeeService,
    private stockService: StockService,
    private refundService: RefundService,
    private invoiceCalcService: InvoiceCalcService,
  ) { }

  async getFeePreview(amount: number, mode: string = 'AUTO_CUSTOMER') {
    const isReseller = mode === 'AUTO_RESELLER';
    const rules = await this.feeService.getFeeRules(isReseller ? 'RESELLER' : 'CUSTOMER');
    return {
      amount,
      ...this.feeService.calculateServiceFee(amount, rules),
      rules,
    };
  }

  async getSummary() {
    const counts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { id: true },
    });
    const total = await this.prisma.order.count({ where: { deletedAt: null } });
    const summary: Record<string, number> = { TOTAL: total };
    for (const c of counts) {
      summary[c.status] = c._count.id;
    }
    return summary;
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
    const skip = (page - 1) * limit;
    const search = String(query.search || '').trim().slice(0, 100);
    const status = query.status ? String(query.status) : undefined;
    const periodId = query.periodId ? Number(query.periodId) : undefined;
    const customerId = query.customerId ? Number(query.customerId) : undefined;
    const uninvoiced = String(query.uninvoiced || '') === '1';

    const where: any = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(periodId ? { periodId } : {}),
      ...(customerId ? { customerId } : {}),
      ...(uninvoiced ? { invoiceLinks: { none: {} } } : {}),
      ...(search
        ? {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customer: { fullName: { contains: search, mode: 'insensitive' } } },
            { customer: { customerCode: { contains: search, mode: 'insensitive' } } },
            { customer: { whatsapp: { contains: search } } },
            { customer: { email: { contains: search, mode: 'insensitive' } } },
            { period: { code: { contains: search, mode: 'insensitive' } } },
            { period: { name: { contains: search, mode: 'insensitive' } } },
            { admin: { name: { contains: search, mode: 'insensitive' } } },
            { customerNotes: { contains: search, mode: 'insensitive' } },
            { internalNotes: { contains: search, mode: 'insensitive' } },
            { items: { some: { manualProductName: { contains: search, mode: 'insensitive' } } } },
            { items: { some: { brandName: { contains: search, mode: 'insensitive' } } } },
            { items: { some: { variation: { contains: search, mode: 'insensitive' } } } },
            { items: { some: { size: { contains: search, mode: 'insensitive' } } } },
            { items: { some: { color: { contains: search, mode: 'insensitive' } } } },
            { items: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
            { items: { some: { product: { sku: { contains: search, mode: 'insensitive' } } } } },
            { items: { some: { product: { brandName: { contains: search, mode: 'insensitive' } } } } },
          ],
        }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: {
          customer: true,
          period: true,
          items: { include: { product: true } },
          invoiceLinks: { include: { invoice: true } },
          admin: { select: { name: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    return this.prisma.order.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        period: true,
        items: {
          include: {
            product: true,
            purchases: true,
            statusHistories: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
          },
        },
        payments: { where: { deletedAt: null } },
        shipments: true,
        refunds: { where: { deletedAt: null } },
        invoiceLinks: { include: { invoice: true } },
        admin: { select: { name: true } },
      },
    });
  }

  async create(body: any, userId?: number) {
    const isReseller = body.serviceFeeMode === 'AUTO_RESELLER';
    const isAuto = body.serviceFeeMode === 'AUTO' || body.serviceFeeMode === 'AUTO_CUSTOMER' || isReseller || !body.serviceFeeMode;
    const rules = await this.feeService.getFeeRules(isReseller ? 'RESELLER' : 'CUSTOMER');
    const automatic = this.feeService.calculateServiceFee(subtotalIdr(body.items || []), rules);
    const resolvedServiceFee = isAuto ? automatic.fee : (body.serviceFee || 0);
    const totals = calculateOrderTotals({ ...body, serviceFee: resolvedServiceFee }, body.items || []);

    const data = await this.prisma.$transaction(async tx => {
      const order = await tx.order.create({
        data: {
          orderNumber: body.orderNumber || sequence('ORD'),
          orderDate: body.orderDate || new Date(),
          periodId: body.periodId,
          customerId: body.customerId,
          adminId: body.adminId || userId,
          status: body.status || 'NEW',
          currencyCode: 'IDR',
          exchangeRate: 1,
          ...totals,
          serviceFeeMode: (body.serviceFeeMode || 'AUTO_CUSTOMER') as any,
          serviceFeeNote: body.serviceFeeNote || null,
          customerNotes: body.customerNotes || null,
          internalNotes: body.internalNotes || null,
          dueDate: body.dueDate || null,
        },
      });

      for (const item of body.items || []) {
        if ((!item.productId || item.productId === '__NEW_PRODUCT__') && (item.newProduct || item.manualProductName || item.name)) {
          const pData = item.newProduct || item;
          const createdProduct = await tx.product.create({
            data: {
              sku: pData.sku || sequence('SKU'),
              name: pData.name || pData.productName || item.manualProductName || 'New Product',
              category: pData.category || null,
              brandName: pData.brandName || null,
              storeLocation: pData.storeLocation || null,
              productUrl: pData.productUrl || null,
              imageUrl: pData.imageUrl || null,
              defaultCurrency: 'IDR',
              stockMode: pData.stockMode || 'EVENT',
              stockQuantity: Number(pData.stockQuantity || 0),
              buyPrice: Number(pData.buyPrice || 0),
              sellingPrice: Number(item.unitPriceForeign || pData.sellingPrice || 0),
              periodId: pData.periodId || body.periodId || null,
              notes: pData.notes || null,
            },
          });
          item.productId = createdProduct.id;
          if (createdProduct.stockQuantity > 0) {
            await tx.inventoryMovement.create({
              data: {
                productId: createdProduct.id,
                movementType: 'INITIAL',
                quantity: createdProduct.stockQuantity,
                balanceAfter: createdProduct.stockQuantity,
                referenceType: 'PRODUCT',
                referenceId: String(createdProduct.id),
                notes: 'Stok awal produk dari pesanan baru.',
                userId,
              },
            });
          }
        }

        let sourceType = item.sourceType || 'CATALOG';
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product && product.stockMode === 'READY_STOCK') {
            sourceType = 'READY_STOCK';
          }
        }
        const initialFulfillment = sourceType === 'READY_STOCK' ? 'AVAILABLE' : (item.fulfillmentStatus || 'PENDING');
        const row = await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId || null,
            manualProductName: item.manualProductName || null,
            brandName: item.brandName || null,
            sourceType: sourceType as any,
            fulfillmentStatus: item.fulfillmentStatus || initialFulfillment as any,
            keptUntil: item.fulfillmentStatus === 'KEPT' ? item.keptUntil : null,
            variation: item.variation || null,
            size: item.size || null,
            color: item.color || null,
            quantity: item.quantity || 1,
            unitPriceForeign: item.unitPriceForeign || 0,
            targetPriceIdr: item.targetPriceIdr ?? item.unitPriceForeign ?? 0,
            purchaseNotes: item.purchaseNotes || null,
            photoUrl: item.photoUrl || null,
          },
        });

        if (sourceType === 'READY_STOCK' && item.productId) {
          await this.stockService.reserveReadyStock(tx, item.productId, item.quantity, userId, String(row.id));
        }

        await tx.itemStatusHistory.create({
          data: { orderItemId: row.id, toStatus: item.fulfillmentStatus || initialFulfillment, notes: 'Status awal item.', userId },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { customer: true, period: true, items: { include: { product: true } } },
      });
    });

    await this.prisma.notification.create({
      data: {
        type: 'ORDER',
        title: 'Pesanan baru dicatat',
        message: `${data.orderNumber} • ${data.customer.fullName} • ${data.items.length} item • Total Rp${Number(data.totalBill).toLocaleString('id-ID')}`,
        link: '/orders',
      },
    });

    return data;
  }

  async update(id: number, body: any, userId?: number) {
    const current = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true, invoiceLinks: true },
    });

    const items = body.items || current.items;
    const serviceFeeMode = body.serviceFeeMode ?? current.serviceFeeMode;
    const isReseller = serviceFeeMode === 'AUTO_RESELLER';
    const isAuto = serviceFeeMode === 'AUTO' || serviceFeeMode === 'AUTO_CUSTOMER' || isReseller;
    const rules = await this.feeService.getFeeRules(isReseller ? 'RESELLER' : 'CUSTOMER');
    const automatic = this.feeService.calculateServiceFee(subtotalIdr(items), rules);
    const resolvedServiceFee = isAuto ? automatic.fee : (body.serviceFee ?? current.serviceFee);
    const totals = calculateOrderTotals({ ...current, ...body, serviceFee: resolvedServiceFee }, items);

    const data = await this.prisma.$transaction(async tx => {
      if (body.items) {
        for (const oldItem of current.items) {
          if (oldItem.sourceType === 'READY_STOCK' && oldItem.productId && !['UNAVAILABLE', 'SHIPPED', 'DELIVERED'].includes(oldItem.fulfillmentStatus)) {
            await this.stockService.releaseReadyStock(tx, oldItem.productId, oldItem.quantity, userId, String(oldItem.id), 'Reservasi dilepas karena pembaruan pesanan.');
          }
        }
        await tx.orderItem.deleteMany({ where: { orderId: id } });

        for (const item of body.items) {
          const row = await tx.orderItem.create({
            data: {
              orderId: id,
              productId: item.productId || null,
              manualProductName: item.manualProductName || null,
              brandName: item.brandName || null,
              sourceType: item.sourceType || 'CATALOG',
              fulfillmentStatus: item.fulfillmentStatus || 'PENDING',
              keptUntil: item.fulfillmentStatus === 'KEPT' ? item.keptUntil : null,
              variation: item.variation || null,
              size: item.size || null,
              color: item.color || null,
              quantity: item.quantity || 1,
              unitPriceForeign: item.unitPriceForeign || 0,
              targetPriceIdr: item.targetPriceIdr ?? item.unitPriceForeign ?? 0,
              purchaseNotes: item.purchaseNotes || null,
              photoUrl: item.photoUrl || null,
            },
          });

          if (item.sourceType === 'READY_STOCK' && item.productId) {
            await this.stockService.reserveReadyStock(tx, item.productId, item.quantity, userId, String(row.id));
          }

          await tx.itemStatusHistory.create({
            data: { orderItemId: row.id, toStatus: item.fulfillmentStatus || 'PENDING', notes: 'Pembaruan item pesanan.', userId },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          ...body,
          ...totals,
          items: undefined,
          serviceFeeMode,
        },
        include: { customer: true, period: true, items: { include: { product: true } }, invoiceLinks: true },
      });

      if (updated.invoiceLinks?.[0]?.invoiceId) {
        await tx.invoiceOrder.updateMany({
          where: { orderId: id },
          data: { snapshotAmount: updated.totalBill },
        });
      }

      return updated;
    });

    if (data.invoiceLinks?.[0]?.invoiceId) {
      await this.invoiceCalcService.refreshInvoicePayment(data.invoiceLinks[0].invoiceId);
    } else {
      await this.invoiceCalcService.refreshOrderPayment(id);
    }

    return data;
  }

  async remove(id: number, userId?: number) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true, invoiceLinks: true },
    });

    for (const item of order.items) {
      if (item.sourceType === 'READY_STOCK' && item.productId && !['UNAVAILABLE', 'SHIPPED', 'DELIVERED'].includes(item.fulfillmentStatus)) {
        await this.stockService.releaseReadyStock(this.prisma, item.productId, item.quantity, userId, String(item.id), 'Stok dilepas karena pesanan dihapus.');
      }
    }

    await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });

    if (order.invoiceLinks?.[0]?.invoiceId) {
      await this.invoiceCalcService.refreshInvoicePayment(order.invoiceLinks[0].invoiceId);
    }
    return { success: true };
  }
}
