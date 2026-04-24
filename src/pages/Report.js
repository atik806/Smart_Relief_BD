import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';
import './Report.css';

const ISSUE_TYPES = [
  'Flood damage',
  'Road blocked',
  'Power outage',
  'Medical emergency',
  'Missing person',
  'Infrastructure damage',
  'Other',
];

const DIVISIONS = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
];

/** Major districts per division (Bangladesh) — drives autocomplete */
const DISTRICTS_BY_DIVISION = {
  Barishal: [
    'Barguna',
    'Barishal',
    'Bhola',
    'Jhalokathi',
    'Patuakhali',
    'Pirojpur',
  ],
  Chattogram: [
    'Bandarban',
    'Brahmanbaria',
    'Chandpur',
    'Chattogram',
    "Cox's Bazar",
    'Cumilla',
    'Feni',
    'Khagrachhari',
    'Lakshmipur',
    'Noakhali',
    'Rangamati',
  ],
  Dhaka: [
    'Dhaka',
    'Faridpur',
    'Gazipur',
    'Gopalganj',
    'Kishoreganj',
    'Madaripur',
    'Manikganj',
    'Munshiganj',
    'Narayanganj',
    'Narsingdi',
    'Rajbari',
    'Shariatpur',
    'Tangail',
  ],
  Khulna: [
    'Bagerhat',
    'Chuadanga',
    'Jashore',
    'Jhenaidah',
    'Khulna',
    'Kushtia',
    'Magura',
    'Meherpur',
    'Narail',
    'Satkhira',
  ],
  Mymensingh: ['Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'],
  Rajshahi: [
    'Bogura',
    'Chapai Nawabganj',
    'Joypurhat',
    'Naogaon',
    'Natore',
    'Pabna',
    'Rajshahi',
    'Sirajganj',
  ],
  Rangpur: [
    'Dinajpur',
    'Gaibandha',
    'Kurigram',
    'Lalmonirhat',
    'Nilphamari',
    'Panchagarh',
    'Rangpur',
    'Thakurgaon',
  ],
  Sylhet: ['Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'],
};

const DESC_MAX = 500;

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

/** Mock + user reports; `createdAt` sorts “most recent”; `time` is display label */
const initialReports = [
  {
    id: 'seed-1',
    issueType: 'Flood damage',
    division: 'Sylhet',
    district: 'Sylhet',
    description:
      'Embankment stress along Surma; water pooling in wards 3–4. Volunteers sandbagging overnight.',
    priority: 'high',
    status: 'Pending',
    time: '45 minutes ago',
    createdAt: Date.now() - 45 * 60 * 1000,
    upvotes: 18,
    photoUrl: null,
  },
  {
    id: 'seed-2',
    issueType: 'Road blocked',
    division: 'Dhaka',
    district: 'Dhaka',
    description:
      'Flood debris and a fallen tree blocking Mirpur Road near Sony Cinema Hall; buses diverting.',
    priority: 'high',
    status: 'In Progress',
    time: '2 hours ago',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    upvotes: 42,
    photoUrl: null,
  },
  {
    id: 'seed-3',
    issueType: 'Power outage',
    division: 'Chattogram',
    district: 'Chattogram',
    description:
      'Transformer fault — no electricity in Lane 7 since dawn; elderly on oxygen need priority.',
    priority: 'medium',
    status: 'Pending',
    time: '3 hours ago',
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    upvotes: 9,
    photoUrl: null,
  },
  {
    id: 'seed-4',
    issueType: 'Medical emergency',
    division: 'Khulna',
    district: 'Khulna',
    description:
      'Flood-affected shelter requests ambulance; suspected dehydration in several children.',
    priority: 'high',
    status: 'In Progress',
    time: '1 hour ago',
    createdAt: Date.now() - 60 * 60 * 1000,
    upvotes: 56,
    photoUrl: null,
  },
  {
    id: 'seed-5',
    issueType: 'Missing person',
    division: 'Rangpur',
    district: 'Kurigram',
    description:
      'Elderly man last seen near char area during evacuation boat; family contact on file.',
    priority: 'high',
    status: 'Pending',
    time: '6 hours ago',
    createdAt: Date.now() - 6 * 60 * 60 * 1000,
    upvotes: 124,
    photoUrl: null,
  },
  {
    id: 'seed-6',
    issueType: 'Infrastructure damage',
    division: 'Rajshahi',
    district: 'Natore',
    description:
      'Small bridge approach washed out; rural road closed — signage requested both sides.',
    priority: 'medium',
    status: 'Resolved',
    time: '1 day ago',
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
    upvotes: 31,
    photoUrl: null,
  },
];

function issueIcon(type) {
  const map = {
    'Flood damage': '🌊',
    'Road blocked': '🚧',
    'Power outage': '⚡',
    'Medical emergency': '🏥',
    'Missing person': '🔍',
    'Infrastructure damage': '🏗️',
    Other: '📋',
  };
  return map[type] || '📋';
}

function issueTypeBadgeClass(issueType) {
  const map = {
    'Flood damage': 'issue-badge--flood',
    'Road blocked': 'issue-badge--road',
    'Power outage': 'issue-badge--power',
    'Medical emergency': 'issue-badge--medical',
    'Missing person': 'issue-badge--missing',
    'Infrastructure damage': 'issue-badge--infra',
    Other: 'issue-badge--other',
  };
  return map[issueType] || 'issue-badge--other';
}

function formatLocation(district, division) {
  return `${district}, ${division} Division`;
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

function normalizeStatus(status) {
  if (status === 'Submitted') return 'Pending';
  if (status === 'In progress') return 'In Progress';
  return status;
}

const Report = () => {
  const showToast = useToast();
  const fileInputRef = useRef(null);
  const districtWrapRef = useRef(null);
  const formId = useId();

  const [issueType, setIssueType] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [districtOpen, setDistrictOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [errors, setErrors] = useState({});
  const [reports, setReports] = useState(initialReports);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [filterIssueType, setFilterIssueType] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const districtList = useMemo(() => {
    if (!division) return [];
    return DISTRICTS_BY_DIVISION[division] || [];
  }, [division]);

  const filteredDistricts = useMemo(() => {
    const q = district.trim().toLowerCase();
    if (!q) return districtList.slice(0, 8);
    return districtList.filter((d) => d.toLowerCase().includes(q)).slice(0, 12);
  }, [district, districtList]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (districtWrapRef.current && !districtWrapRef.current.contains(e.target)) {
        setDistrictOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const pickFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoFile(file);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      pickFile(f);
    },
    [pickFile]
  );

  const validate = () => {
    const next = {};
    if (!issueType) next.issueType = 'Select an issue type.';
    if (!division) next.division = 'Select a division.';
    if (!district.trim()) next.district = 'Enter or select a district.';
    if (!description.trim()) next.description = 'Describe the issue.';
    else if (description.length > DESC_MAX) {
      next.description = `Keep description under ${DESC_MAX} characters.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the highlighted fields.', 'warning');
      return;
    }

    setSubmitLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 450));

      const listPhotoUrl = photoFile ? URL.createObjectURL(photoFile) : null;

      const now = Date.now();
      const newReport = {
        id: `r-${now}`,
        issueType,
        division,
        district: district.trim(),
        description: description.slice(0, DESC_MAX).trim(),
        priority,
        status: 'Pending',
        time: 'Just now',
        createdAt: now,
        upvotes: 0,
        photoUrl: listPhotoUrl,
      };

      setReports((prev) => [newReport, ...prev]);
      showToast('Report submitted successfully.', 'success');

      setIssueType('');
      setDivision('');
      setDistrict('');
      setDescription('');
      setPriority('medium');
      clearPhoto();
      setErrors({});
    } finally {
      setSubmitLoading(false);
    }
  };

  const descRemaining = DESC_MAX - description.length;

  const filteredSortedReports = useMemo(() => {
    let list = reports.map((r) => ({
      ...r,
      status: normalizeStatus(r.status),
      upvotes: typeof r.upvotes === 'number' ? r.upvotes : 0,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : 0,
    }));

    if (filterIssueType) {
      list = list.filter((r) => r.issueType === filterIssueType);
    }
    if (filterDivision) {
      list = list.filter((r) => r.division === filterDivision);
    }
    if (filterStatus) {
      list = list.filter((r) => r.status === filterStatus);
    }

    const sorted = [...list];
    if (sortBy === 'recent') {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'priority') {
      sorted.sort(
        (a, b) =>
          (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
      );
    } else if (sortBy === 'upvotes') {
      sorted.sort((a, b) => b.upvotes - a.upvotes);
    }
    return sorted;
  }, [
    reports,
    filterIssueType,
    filterDivision,
    filterStatus,
    sortBy,
  ]);

  const handleUpvote = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, upvotes: (r.upvotes ?? 0) + 1 } : r
      )
    );
  };

  return (
    <PageTransition>
      <div className="report-page">
        <div className="container">
        <motion.header
          className="report-hero"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="report-hero-title">SmartCity Issue Reporter</h1>
        </motion.header>

        <motion.div
          className="report-summary-stats glass-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          role="region"
          aria-label="Platform summary"
        >
          <div className="report-summary-item">
            <span className="report-summary-label">Total reports</span>
            <strong className="report-summary-value">247</strong>
          </div>
          <div className="report-summary-item">
            <span className="report-summary-label">Resolved</span>
            <strong className="report-summary-value report-summary-value--ok">
              89%
            </strong>
          </div>
          <div className="report-summary-item">
            <span className="report-summary-label">Avg response</span>
            <strong className="report-summary-value">2.4h</strong>
          </div>
          <div className="report-summary-item">
            <span className="report-summary-label">Active teams</span>
            <strong className="report-summary-value">12</strong>
          </div>
        </motion.div>

        <div className="report-content report-content--stack">
          <motion.section
            className="report-form-section glass-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            aria-labelledby={`${formId}-title`}
          >
            <h2 id={`${formId}-title`} className="report-section-title">
              Submit a report
            </h2>

            <div className="report-form-stack">
              <div className="form-group">
                <label htmlFor={`${formId}-issue`}>Issue type</label>
                <select
                  id={`${formId}-issue`}
                  value={issueType}
                  onChange={(e) => {
                    setIssueType(e.target.value);
                    setErrors((p) => ({ ...p, issueType: undefined }));
                  }}
                  className={errors.issueType ? 'input-error' : ''}
                >
                  <option value="">Select issue type</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.issueType ? (
                  <p className="field-error" role="alert">
                    {errors.issueType}
                  </p>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor={`${formId}-division`}>Division</label>
                <select
                  id={`${formId}-division`}
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict('');
                    setDistrictOpen(false);
                    setErrors((p) => ({ ...p, division: undefined, district: undefined }));
                  }}
                  className={errors.division ? 'input-error' : ''}
                >
                  <option value="">Select division</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.division ? (
                  <p className="field-error" role="alert">
                    {errors.division}
                  </p>
                ) : null}
              </div>

              <div
                className="form-group district-autocomplete"
                ref={districtWrapRef}
              >
                <label htmlFor={`${formId}-district`}>District</label>
                <input
                  id={`${formId}-district`}
                  type="text"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setDistrictOpen(true);
                    setErrors((p) => ({ ...p, district: undefined }));
                  }}
                  onFocus={() => division && setDistrictOpen(true)}
                  placeholder={
                    division ? 'Type or pick a district' : 'Select a division first'
                  }
                  disabled={!division}
                  autoComplete="off"
                  className={errors.district ? 'input-error' : ''}
                  role="combobox"
                  aria-expanded={districtOpen && filteredDistricts.length > 0}
                  aria-controls={`${formId}-district-list`}
                  aria-autocomplete="list"
                />
                {districtOpen && division && filteredDistricts.length > 0 ? (
                  <ul
                    id={`${formId}-district-list`}
                    className="district-suggestions"
                    role="listbox"
                    aria-label="District suggestions"
                  >
                    {filteredDistricts.map((d) => (
                      <li key={d} role="presentation">
                        <button
                          type="button"
                          className="district-suggestion-btn"
                          role="option"
                          aria-selected={district === d}
                          onClick={() => {
                            setDistrict(d);
                            setDistrictOpen(false);
                            setErrors((p) => ({ ...p, district: undefined }));
                          }}
                        >
                          {d}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {errors.district ? (
                  <p className="field-error" role="alert">
                    {errors.district}
                  </p>
                ) : null}
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor={`${formId}-desc`}>Description</label>
                  <span
                    className={`char-counter ${descRemaining < 0 ? 'char-counter--over' : ''}`}
                  >
                    {description.length}/{DESC_MAX}
                  </span>
                </div>
                <textarea
                  id={`${formId}-desc`}
                  value={description}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v.length <= DESC_MAX) setDescription(v);
                    setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  placeholder="What happened? Location details help responders."
                  rows={5}
                  className={errors.description ? 'input-error' : ''}
                />
                {errors.description ? (
                  <p className="field-error" role="alert">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <fieldset className="priority-fieldset">
                <legend className="priority-legend">Priority</legend>
                <div className="priority-pills" role="radiogroup" aria-label="Priority">
                  {PRIORITIES.map((p) => (
                    <label
                      key={p.value}
                      className={`priority-pill ${priority === p.value ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="report-priority"
                        value={p.value}
                        checked={priority === p.value}
                        onChange={() => setPriority(p.value)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="form-group">
                <span className="form-label-static">Photo (optional)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  id={`${formId}-photo`}
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Add photo: click or drag and drop an image"
                  className={`photo-dropzone ${dragActive ? 'is-dragover' : ''}`}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreviewUrl ? (
                    <div className="photo-preview-wrap">
                      <img src={photoPreviewUrl} alt="" className="photo-preview-thumb" />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        aria-label="Remove uploaded photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPhoto();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="photo-dropzone-placeholder">
                      <span className="photo-drop-icon" aria-hidden>
                        📷
                      </span>
                      <p>
                        Drag and drop an image here, or{' '}
                        <span className="photo-linkish">click to upload</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={`btn btn-primary report-submit-btn ${submitLoading ? 'is-loading' : ''}`}
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? <Spinner size={20} /> : null}
                Submit Report
              </button>
            </div>
          </motion.section>

          <motion.section
            className="recent-reports-section"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            aria-label="Recent reports"
          >
            <div className="recent-section-head">
              <h2 className="report-section-title recent-section-title">
                Recent reports
              </h2>
              <span className="report-count">
                {filteredSortedReports.length} shown · {reports.length} total
              </span>
            </div>

            <div className="report-filters-bar glass-card">
              <div className="report-filters-grid">
                <div className="filter-field">
                  <label htmlFor={`${formId}-filter-type`}>Issue type</label>
                  <select
                    id={`${formId}-filter-type`}
                    value={filterIssueType}
                    onChange={(e) => setFilterIssueType(e.target.value)}
                    className="report-filter-select"
                  >
                    <option value="">All types</option>
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-field">
                  <label htmlFor={`${formId}-filter-division`}>Division</label>
                  <select
                    id={`${formId}-filter-division`}
                    value={filterDivision}
                    onChange={(e) => setFilterDivision(e.target.value)}
                    className="report-filter-select"
                  >
                    <option value="">All divisions</option>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-field">
                  <label htmlFor={`${formId}-filter-status`}>Status</label>
                  <select
                    id={`${formId}-filter-status`}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="report-filter-select"
                  >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="report-sort-row">
                <span className="sort-label">Sort by</span>
                <div className="sort-toggle-group" role="group" aria-label="Sort reports">
                  {[
                    { id: 'recent', label: 'Most recent' },
                    { id: 'priority', label: 'Priority' },
                    { id: 'upvotes', label: 'Most upvoted' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`sort-toggle ${sortBy === opt.id ? 'is-active' : ''}`}
                      onClick={() => setSortBy(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="reports-list reports-list--feed">
              {filteredSortedReports.length === 0 ? (
                <p className="reports-empty">No reports match these filters.</p>
              ) : (
                filteredSortedReports.map((report, index) => (
                  <motion.article
                    key={report.id}
                    className="recent-report-card glass-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.18) }}
                  >
                    <div className="recent-card-row recent-card-row--top">
                      <div className="recent-badge-group">
                        <span
                          className={`issue-type-badge ${issueTypeBadgeClass(
                            report.issueType
                          )}`}
                        >
                          {issueIcon(report.issueType)}{' '}
                          <span className="issue-type-badge-text">
                            {report.issueType}
                          </span>
                        </span>
                        <span
                          className={`priority-pill-badge priority-pill-badge--${report.priority}`}
                        >
                          {report.priority}
                        </span>
                      </div>
                      <div className="recent-card-row-end">
                        <span
                          className={`status-pill status-pill--${normalizeStatus(
                            report.status
                          )
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {normalizeStatus(report.status)}
                        </span>
                        <button
                          type="button"
                          className="upvote-btn"
                          onClick={() => handleUpvote(report.id)}
                          aria-label={`Upvote report (${report.upvotes} votes)`}
                        >
                          <span className="upvote-icon" aria-hidden>
                            ▲
                          </span>
                          <span className="upvote-count">{report.upvotes}</span>
                        </button>
                      </div>
                    </div>
                    <p className="recent-location-line">
                      {formatLocation(report.district, report.division)}
                    </p>
                    <p className="recent-description-clamp">{report.description}</p>
                    {report.photoUrl ? (
                      <div className="report-thumb-inline report-thumb-inline--card">
                        <img src={report.photoUrl} alt="" />
                      </div>
                    ) : null}
                    <div className="recent-card-footer">
                      <span className="recent-time-ago">{report.time}</span>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </motion.section>
        </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Report;
