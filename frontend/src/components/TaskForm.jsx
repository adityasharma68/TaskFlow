// src/components/TaskForm.jsx
// ============================================================
// TaskForm – Reusable form used in both "Create" and "Edit" modes.
// Props:
//   initialData – pre-populate fields when editing
//   onSubmit(payload) – async handler from parent
//   onCancel() – dismiss modal / clear form
//   mode – 'create' | 'edit'
// ============================================================

import { useState, useEffect } from 'react';

const EMPTY = {
  title:       '',
  description: '',
  due_date:    '',
  status:      'Pending',
  remarks:     '',
  created_by:  '',
  updated_by:  '',
};

const TaskForm = ({ initialData = {}, onSubmit, onCancel, mode = 'create' }) => {
  const [form,    setForm]    = useState({ ...EMPTY, ...initialData });
  const [busy,    setBusy]    = useState(false);
  const [errors,  setErrors]  = useState({});

  // Sync form when initialData changes (editing different task)
  useEffect(() => {
    setForm({ ...EMPTY, ...initialData });
    setErrors({});
  }, [initialData?.id]);

  // ── Validation ──────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title      = 'Title is required.';
    if (form.title.length > 255)  errs.title      = 'Title must be ≤ 255 characters.';
    if (form.due_date && isNaN(Date.parse(form.due_date)))
                                  errs.due_date   = 'Invalid date.';
    return errs;
  };

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setBusy(true);
    try {
      await onSubmit(form);
    } finally {
      setBusy(false);
    }
  };

  const isEdit = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Title */}
      <div>
        <label className="form-label" htmlFor="title">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title" name="title" type="text"
          className={`form-input ${errors.title ? 'border-red-500 focus:ring-red-500/30' : ''}`}
          placeholder="e.g. Implement OAuth login"
          value={form.title} onChange={handleChange} maxLength={255}
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description" name="description" rows={3}
          className="form-input resize-none"
          placeholder="What needs to be done?"
          value={form.description} onChange={handleChange}
        />
      </div>

      {/* Due Date + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label" htmlFor="due_date">Due Date</label>
          <input
            id="due_date" name="due_date" type="date"
            className={`form-input ${errors.due_date ? 'border-red-500' : ''}`}
            value={form.due_date} onChange={handleChange}
          />
          {errors.due_date && <p className="mt-1 text-xs text-red-400">{errors.due_date}</p>}
        </div>
        <div>
          <label className="form-label" htmlFor="status">Status</label>
          <select
            id="status" name="status"
            className="form-input"
            value={form.status} onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="form-label" htmlFor="remarks">Remarks</label>
        <textarea
          id="remarks" name="remarks" rows={2}
          className="form-input resize-none"
          placeholder="Any notes or blockers?"
          value={form.remarks} onChange={handleChange}
        />
      </div>

      {/* Created By / Updated By */}
      <div className="grid grid-cols-2 gap-3">
        {!isEdit && (
          <div>
            <label className="form-label" htmlFor="created_by">Created By</label>
            <input
              id="created_by" name="created_by" type="text"
              className="form-input"
              placeholder="Your name"
              value={form.created_by} onChange={handleChange} maxLength={100}
            />
          </div>
        )}
        {isEdit && (
          <div className="col-span-2">
            <label className="form-label" htmlFor="updated_by">Updated By</label>
            <input
              id="updated_by" name="updated_by" type="text"
              className="form-input"
              placeholder="Your name"
              value={form.updated_by} onChange={handleChange} maxLength={100}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy
            ? (isEdit ? 'Saving…' : 'Creating…')
            : (isEdit ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
