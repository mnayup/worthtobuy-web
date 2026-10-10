import type { FieldConfig } from '~/types';
import type { ValidationSummary } from '~/lib/master-data-validator';
import { ConfirmDialog } from '../ConfirmDialog';
import { FormModal } from '../FormModal';
import { ImportValidationModal } from '../ImportValidationModal';
import { Toast } from '../Toast';

interface CrudModalsProps {
  modal: boolean;
  editing: any | null;
  entityName?: string;
  title: string;
  fields: FieldConfig[];
  prepareInitial?: (row: any) => Record<string, any>;
  saving: boolean;
  endpoint: string;
  onModalClose: () => void;
  onSave: (form: Record<string, any>) => Promise<void>;
  deleting: any | null;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => Promise<void>;
  bulkDeleteOpen: boolean;
  selectedCount: number;
  onBulkDeleteCancel: () => void;
  onBulkDeleteConfirm: () => Promise<void>;
  validationSummary: ValidationSummary | null;
  onValidationClose: () => void;
  onValidationSuccess: (count: number) => Promise<void>;
  onValidationReupload: () => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null;
  onToastClose: () => void;
}

export function CrudModals({
  modal,
  editing,
  entityName,
  title,
  fields,
  prepareInitial,
  saving,
  endpoint,
  onModalClose,
  onSave,
  deleting,
  onDeleteCancel,
  onDeleteConfirm,
  bulkDeleteOpen,
  selectedCount,
  onBulkDeleteCancel,
  onBulkDeleteConfirm,
  validationSummary,
  onValidationClose,
  onValidationSuccess,
  onValidationReupload,
  toast,
  onToastClose,
}: CrudModalsProps) {
  const entityType = endpoint ? endpoint.replace(/^\//, '').split('/')[0] : undefined;

  return (
    <>
      <FormModal
        open={modal}
        title={editing ? `Edit ${entityName || title}` : `New ${entityName || title}`}
        fields={fields}
        initial={
          editing ? (prepareInitial ? prepareInitial(editing) : editing) : undefined
        }
        loading={saving}
        entityType={entityType}
        onClose={onModalClose}
        onSubmit={onSave}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Move to Trash?"
        message="This record will be moved to the Trash and can be restored at any time."
        loading={saving}
        onCancel={onDeleteCancel}
        onConfirm={onDeleteConfirm}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Move ${selectedCount} items to Trash?`}
        message="The checked items will be moved to the Trash menu and can be restored."
        loading={saving}
        onCancel={onBulkDeleteCancel}
        onConfirm={onBulkDeleteConfirm}
      />

      {validationSummary && (
        <ImportValidationModal
          validation={validationSummary}
          endpoint={endpoint}
          entityTitle={entityName || title}
          onClose={onValidationClose}
          onSuccess={onValidationSuccess}
          onReupload={onValidationReupload}
        />
      )}

      {toast && <Toast {...toast} onClose={onToastClose} />}
    </>
  );
}
