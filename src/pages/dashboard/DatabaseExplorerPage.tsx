import React, { useState, useEffect } from 'react';
import { 
  Table2, 
  Search, 
  Plus, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Code2, 
  RefreshCw, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { dashboardApi, type TableItem, type ColumnDefinition } from '../../services/dashboardApi';

interface DatabaseExplorerPageProps {
  isCreateTableModalOpen?: boolean;
  onCloseCreateTableModal?: () => void;
}

export const DatabaseExplorerPage: React.FC<DatabaseExplorerPageProps> = ({
  isCreateTableModalOpen: externalCreateTableOpen,
  onCloseCreateTableModal: externalCloseCreateTable
}) => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [rowSearch, setRowSearch] = useState('');
  const [isCreateTableModal, setIsCreateTableModal] = useState(false);
  
  // Row Edit / Add Modal
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [rowDataInput, setRowDataInput] = useState<Record<string, string>>({});

  // SQL Runner state
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState(true);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM quick_commerce_orders WHERE status = \'DELIVERED\' LIMIT 20;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[]; latencyMs: number; count: number } | null>(null);
  const [sqlRunning, setSqlRunning] = useState(false);

  // New Table Form state
  const [newTableName, setNewTableName] = useState('');
  const [newTableRls, setNewTableRls] = useState(true);
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { name: 'id', type: 'UUID', isPrimary: true, nullable: false, default: 'gen_random_uuid()' },
    { name: 'created_at', type: 'TIMESTAMP', isPrimary: false, nullable: false, default: 'NOW()' },
    { name: 'title', type: 'VARCHAR(255)', isPrimary: false, nullable: false, default: '' },
  ]);

  const showCreateTableModal = externalCreateTableOpen !== undefined ? externalCreateTableOpen : isCreateTableModal;
  const closeCreateTableModal = () => {
    if (externalCloseCreateTable) externalCloseCreateTable();
    setIsCreateTableModal(false);
  };

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const loadedTables = dashboardApi.getTables();
    setTables(loadedTables);
    if (loadedTables.length > 0 && !selectedTable) {
      setSelectedTable(loadedTables[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedTable) {
      const r = dashboardApi.getTableRows(selectedTable.name);
      setRows(r);
      setPage(1);
    }
  }, [selectedTable]);

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const filteredRows = rows.filter((r) => {
    if (!rowSearch) return true;
    return Object.values(r).some((v) =>
      String(v).toLowerCase().includes(rowSearch.toLowerCase())
    );
  });

  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

  const handleRunSql = () => {
    setSqlRunning(true);
    setTimeout(() => {
      const res = dashboardApi.executeSql(sqlQuery);
      setSqlResult(res);
      setSqlRunning(false);
    }, 180);
  };

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { name: `col_${columns.length + 1}`, type: 'VARCHAR(255)', isPrimary: false, nullable: true, default: '' },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index: number, field: keyof ColumnDefinition, val: any) => {
    const next = [...columns];
    next[index] = { ...next[index], [field]: val };
    setColumns(next);
  };

  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || columns.length === 0) return;

    const created = dashboardApi.createTable(newTableName, columns, newTableRls);
    const updated = dashboardApi.getTables();
    setTables(updated);
    setSelectedTable(created);
    setNewTableName('');
    closeCreateTableModal();
  };

  const handleOpenAddRow = () => {
    setEditingRow(null);
    const initial: Record<string, string> = {};
    selectedTable?.schema.forEach((col) => {
      initial[col.name] = col.isPrimary ? `id_${Date.now().toString().slice(-4)}` : '';
    });
    setRowDataInput(initial);
    setIsRowModalOpen(true);
  };

  const handleOpenEditRow = (row: any) => {
    setEditingRow(row);
    const initial: Record<string, string> = {};
    Object.keys(row).forEach((k) => {
      initial[k] = String(row[k] ?? '');
    });
    setRowDataInput(initial);
    setIsRowModalOpen(true);
  };

  const handleSaveRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    if (editingRow) {
      dashboardApi.updateRow(selectedTable.name, editingRow.id, rowDataInput);
    } else {
      dashboardApi.insertRow(selectedTable.name, rowDataInput);
    }

    const updated = dashboardApi.getTableRows(selectedTable.name);
    setRows(updated);
    setIsRowModalOpen(false);
    setEditingRow(null);
  };

  const handleDeleteRow = (id: string) => {
    if (!selectedTable) return;
    dashboardApi.deleteRow(selectedTable.name, id);
    setRows(dashboardApi.getTableRows(selectedTable.name));
  };

  return (
    <div className="space-y-6">
      {/* 2-Panel Explorer */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[640px]">
        
        {/* Left Panel: 320px Table List */}
        <div className="w-full md:w-80 md:min-w-[320px] md:max-w-[320px] border-b md:border-b-0 md:border-r border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between">
          <div className="p-4 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Table2 className="w-4 h-4 text-[#1E3A8A]" />
                Schema Tables ({tables.length})
              </span>
              <button
                onClick={() => setIsCreateTableModal(true)}
                className="p-1.5 rounded-lg bg-[#1E3A8A] text-white hover:bg-[#172554] transition-all shadow-xs"
                title="Create New Table"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search Tables Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search tables..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-white focus:ring-2 focus:ring-[#1E3A8A] outline-none"
              />
            </div>
          </div>

          {/* Table List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredTables.map((t) => {
              const isActive = selectedTable?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-white border border-[#CBD5E1] shadow-xs text-[#1E3A8A] font-semibold'
                      : 'hover:bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Table2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1E3A8A]' : 'text-[#94A3B8]'}`} />
                    <span className="text-xs font-mono truncate">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.rls_enabled && (
                      <span title="RLS Enabled" className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        RLS
                      </span>
                    )}
                    <span className="text-[10px] text-[#94A3B8] font-mono">
                      {rows.length || t.row_count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom helper info */}
          <div className="p-3.5 border-t border-[#E2E8F0] bg-white text-[11px] text-[#64748B] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Row-Level Security Active
            </span>
            <span className="font-mono">pg_catalog 16</span>
          </div>
        </div>

        {/* Right Panel: Flexible Data Table */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white">
          
          {/* Table Header & Toolbar */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#FFFFFF] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#0F172A] font-mono">
                    {selectedTable ? selectedTable.name : 'Select a Table'}
                  </h2>
                  {selectedTable?.rls_enabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      RLS Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Showing {filteredRows.length} total records in table.
                </p>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddRow}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E3A8A] text-white hover:bg-[#172554] text-xs font-semibold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Row</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedTable) setRows(dashboardApi.getTableRows(selectedTable.name));
                  }}
                  className="p-2 text-[#475569] hover:bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] transition-colors"
                  title="Refresh Table Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Filter rows by keyword or value..."
                  value={rowSearch}
                  onChange={(e) => setRowSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E3A8A] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table Data View */}
          <div className="flex-1 overflow-auto">
            {selectedTable && paginatedRows.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-mono uppercase tracking-wider">
                    {selectedTable.schema.map((col) => (
                      <th key={col.name} className="py-3 px-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{col.name}</span>
                          <span className="text-[10px] text-[#94A3B8] font-normal lowercase">({col.type})</span>
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#334155] font-mono">
                  {paginatedRows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#F8FAFC] transition-colors group">
                      {selectedTable.schema.map((col) => (
                        <td key={col.name} className="py-3 px-4 whitespace-nowrap max-w-xs truncate">
                          {row[col.name] !== undefined ? (
                            typeof row[col.name] === 'object' ? (
                              JSON.stringify(row[col.name])
                            ) : (
                              String(row[col.name])
                            )
                          ) : (
                            <span className="text-[#CBD5E1] italic">NULL</span>
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEditRow(row)}
                            className="p-1 text-[#475569] hover:text-[#1E3A8A] hover:bg-blue-50 rounded"
                            title="Edit Row"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
                <Table2 className="w-10 h-10 text-[#CBD5E1] mb-2" />
                <p className="text-sm font-semibold text-[#0F172A]">No Rows Found</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Click "+ Add Row" above to insert data into this table.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {paginatedRows.length} of {filteredRows.length} rows (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40 hover:bg-[#F1F5F9]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40 hover:bg-[#F1F5F9]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Editor (Collapsible at bottom) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div 
          onClick={() => setIsSqlEditorOpen(!isSqlEditorOpen)}
          className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-[#1E3A8A]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Interactive SQL Console & Runner</h3>
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#1E3A8A] rounded-full border border-blue-200">
              PostgreSQL Engine
            </span>
          </div>
          <button className="text-[#64748B] hover:text-[#0F172A]">
            {isSqlEditorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isSqlEditorOpen && (
          <div className="p-5 space-y-4">
            <div className="relative">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Write arbitrary SQL query (e.g. SELECT * FROM users;)"
                className="w-full font-mono text-xs p-4 rounded-xl border border-[#CBD5E1] bg-[#0F172A] text-emerald-400 focus:ring-2 focus:ring-[#1E3A8A] outline-none resize-y"
              />
              <button
                onClick={handleRunSql}
                disabled={sqlRunning}
                className="absolute right-3 bottom-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:bg-[#172554] shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{sqlRunning ? 'Executing...' : 'Run Query'}</span>
              </button>
            </div>

            {/* SQL Results Table */}
            {sqlResult && (
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden animate-in fade-in duration-200">
                <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Query executed successfully ({sqlResult.count} rows returned)
                  </span>
                  <span className="font-mono text-[#64748B]">Latency: {sqlResult.latencyMs} ms</span>
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-white border-b border-[#E2E8F0] text-[#64748B]">
                        {sqlResult.columns.map((c) => (
                          <th key={c} className="py-2.5 px-3.5 font-semibold uppercase">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {sqlResult.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-[#F8FAFC]">
                          {sqlResult.columns.map((c) => (
                            <td key={c} className="py-2 px-3.5 text-[#334155] whitespace-nowrap">
                              {String(r[c] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <Table2 className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="text-base font-bold text-[#0F172A]">Create New Relational Table</h3>
              </div>
              <button onClick={closeCreateTableModal} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTableSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase text-[#475569] mb-1">
                  Table Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. invoice_records"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E3A8A] outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rls_toggle"
                  checked={newTableRls}
                  onChange={(e) => setNewTableRls(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
                <label htmlFor="rls_toggle" className="text-xs font-semibold text-[#0F172A]">
                  Enable Row-Level Security (RLS) policies by default
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-[#475569]">
                    Columns & Schema Definition
                  </label>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Column
                  </button>
                </div>

                <div className="space-y-2">
                  {columns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <input
                        type="text"
                        placeholder="column_name"
                        value={col.name}
                        onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white rounded-lg border border-[#CBD5E1] outline-none"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => handleColumnChange(idx, 'type', e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-[#CBD5E1] outline-none font-mono"
                      >
                        <option value="VARCHAR(255)">VARCHAR(255)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="BIGINT">BIGINT</option>
                        <option value="UUID">UUID</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="JSONB">JSONB</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                      </select>
                      <label className="flex items-center gap-1 text-[11px] text-[#475569]">
                        <input
                          type="checkbox"
                          checked={col.isPrimary}
                          onChange={(e) => handleColumnChange(idx, 'isPrimary', e.target.checked)}
                        />
                        PK
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateTableModal}
                  className="px-4 py-2 text-xs font-medium text-[#475569] border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Row Modal */}
      {isRowModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base">
                {editingRow ? 'Edit Record' : `Insert Row into ${selectedTable.name}`}
              </h3>
              <button onClick={() => setIsRowModalOpen(false)} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRow} className="space-y-3">
              {selectedTable.schema.map((col) => (
                <div key={col.name}>
                  <label className="block text-xs font-semibold text-[#475569] mb-1 font-mono">
                    {col.name} <span className="text-[#94A3B8] font-normal">({col.type})</span>
                  </label>
                  <input
                    type="text"
                    value={rowDataInput[col.name] ?? ''}
                    onChange={(e) => setRowDataInput({ ...rowDataInput, [col.name]: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E3A8A] outline-none font-mono"
                  />
                </div>
              ))}

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRowModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#475569] border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-xl shadow-xs"
                >
                  {editingRow ? 'Save Changes' : 'Insert Row'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
