import { memo, useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../../../api/client";
import {
  Box,
  Alert,
  Skeleton,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  FileText,
  Layers,
  Link2,
  ChevronRight,
  ListTree,
  X,
  Check,
  GripVertical,
} from "lucide-react";
import { getDashboardColors } from "../../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../../context/ThemeContext";
import { EmptyState } from "../shared";
import DashboardActionButton from "../shared/DashboardActionButton";
import DashboardGradientButton from "../shared/DashboardGradientButton";
import DashboardInput from "../shared/DashboardInput";
import DashboardCancelButton from "../shared/DashboardCancelButton";
import DashboardConfirmButton from "../shared/DashboardConfirmButton";

// ── tiny unique-id helper (no dependency needed) ─────────────────────────────
let _uidCounter = 0;
const uid = () => `item-${Date.now()}-${++_uidCounter}`;

// ── Item type meta ────────────────────────────────────────────────────────────
const TYPE_META = {
  page: { label: "Page", color: "primary", Icon: FileText },
  section: { label: "Section", color: "secondary", Icon: Layers },
  custom: { label: "Custom URL", color: "default", Icon: ExternalLink },
};

// ─────────────────────────────────────────────────────────────────────────────
// MenusTab
// ─────────────────────────────────────────────────────────────────────────────
const MenusTab = memo(({ website, websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === "dark";

  /* ── view: 'list' | 'editor' ── */
  const [view, setView] = useState("list");
  const [editingMenu, setEditingMenu] = useState(null); // full menu obj or null

  /* ── list state ── */
  const [menus, setMenus] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── editor state ── */
  const [menuName, setMenuName] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [addTab, setAddTab] = useState(0); // 0=Pages, 1=Sections, 2=Custom URL

  // "Add item" panel data
  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Custom URL form
  const [customLabel, setCustomLabel] = useState("");
  const [customTarget, setCustomTarget] = useState("");

  // Inline-edit for a menu item
  const [inlineEdit, setInlineEdit] = useState(null); // item id
  const [inlineLabel, setInlineLabel] = useState("");

  // ── fetch menus ──────────────────────────────────────────────────────────
  const fetchMenus = useCallback(async () => {
    if (!websiteId) return;
    try {
      setListLoading(true);
      setListError(null);
      const res = await apiClient.get(`/websites/${websiteId}/menus`);
      const raw = res.data?.data ?? res.data ?? [];
      setMenus(Array.isArray(raw) ? raw : []);
    } catch (err) {
      // If endpoint not yet implemented treat as empty
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        setMenus([]);
      } else {
        setListError(err?.response?.data?.message || "Failed to load menus.");
      }
    } finally {
      setListLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // ── fetch pages (for add-item panel) ─────────────────────────────────────
  const fetchPages = useCallback(async () => {
    if (!websiteId) return;
    try {
      setPagesLoading(true);
      const res = await apiClient.get(`/websites/${websiteId}/pages`);
      const raw = res.data?.data ?? res.data ?? [];
      setPages(Array.isArray(raw) ? raw : []);
    } catch {
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  }, [websiteId]);

  // ── fetch sections (blocks from homepage) ────────────────────────────────
  const fetchSections = useCallback(async () => {
    if (!websiteId) return;
    try {
      setSectionsLoading(true);
      // Try to get blocks/sections from the website's homepage
      const res = await apiClient.get(`/websites/${websiteId}/sections`);
      const raw = res.data?.data ?? res.data ?? [];
      setSections(Array.isArray(raw) ? raw : []);
    } catch {
      // Fallback: derive from pages blocks if available
      try {
        const pagesRes = await apiClient.get(`/websites/${websiteId}/pages`);
        const pagesRaw = pagesRes.data?.data ?? pagesRes.data ?? [];
        const home = Array.isArray(pagesRaw)
          ? pagesRaw.find((p) => p.isHome || p.path === "/") || pagesRaw[0]
          : null;
        const blocks = home?.blocks ?? home?.content?.blocks ?? [];
        const derived = blocks
          .filter((b) => b.isVisible !== false)
          .map((b) => ({
            id: b.id || b.blockType,
            label: b.content?.editorLabel || b.blockType || "Section",
            anchor: `#${String(b.content?.editorSection || b.id || b.blockType).toLowerCase()}`,
          }));
        setSections(derived);
      } catch {
        setSections([]);
      }
    } finally {
      setSectionsLoading(false);
    }
  }, [websiteId]);

  // ── open editor ───────────────────────────────────────────────────────────
  const openEditor = useCallback(
    (menu) => {
      setEditingMenu(menu);
      setMenuName(menu.name || "");
      setMenuItems(
        Array.isArray(menu.items)
          ? menu.items.map((it) => ({ ...it, id: it.id || uid() }))
          : [],
      );
      setSaveError(null);
      setAddTab(0);
      setCustomLabel("");
      setCustomTarget("");
      setInlineEdit(null);
      setView("editor");
      fetchPages();
      fetchSections();
    },
    [fetchPages, fetchSections],
  );

  // ── create menu ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newMenuName.trim()) return;
    try {
      setCreateLoading(true);
      setCreateError(null);
      const res = await apiClient.post(`/websites/${websiteId}/menus`, {
        name: newMenuName.trim(),
        items: [],
      });
      const created = res.data?.data ?? res.data;
      setMenus((prev) => [...prev, created]);
      setCreateDialogOpen(false);
      setNewMenuName("");
      openEditor(created);
    } catch (err) {
      setCreateError(err?.response?.data?.message || "Failed to create menu.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── delete menu ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await apiClient.delete(`/menus/${deleteTarget.id}`);
      setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setListError(err?.response?.data?.message || "Failed to delete menu.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── save menu ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingMenu) return;
    try {
      setSaveLoading(true);
      setSaveError(null);
      const payload = {
        name: menuName.trim() || editingMenu.name,
        items: menuItems.map(({ id, label, type, target }, order) => ({
          id,
          label,
          type,
          target,
          order,
        })),
      };
      await apiClient.put(`/menus/${editingMenu.id}`, payload);
      setMenus((prev) =>
        prev.map((m) => (m.id === editingMenu.id ? { ...m, ...payload } : m)),
      );
      setView("list");
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Failed to save menu.");
    } finally {
      setSaveLoading(false);
    }
  };

  // ── item helpers ──────────────────────────────────────────────────────────
  const addItem = (item) => {
    setMenuItems((prev) => [...prev, { ...item, id: uid() }]);
  };

  const removeItem = (id) =>
    setMenuItems((prev) => prev.filter((it) => it.id !== id));

  const moveItem = (id, dir) => {
    setMenuItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx < 0) return prev;
      const next = dir === "up" ? idx - 1 : idx + 1;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const commitInlineEdit = (id) => {
    if (inlineLabel.trim()) {
      setMenuItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, label: inlineLabel.trim() } : it,
        ),
      );
    }
    setInlineEdit(null);
  };

  // ── theme helpers ─────────────────────────────────────────────────────────
  const card = {
    bgcolor: isDark ? alpha("#fff", 0.04) : "#fff",
    border: `1px solid ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
    borderRadius: "16px",
  };

  const panelBg = isDark ? alpha("#fff", 0.03) : alpha("#000", 0.02);
  const dividerColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.07);
  const mutedColor = isDark ? alpha("#fff", 0.45) : alpha("#000", 0.45);
  const textColor = colors.text?.primary || (isDark ? "#f1f5f9" : "#0f172a");
  const accentColor = colors.primary || "#6366f1";

  // ─────────────────────────────────────────────────────────────────────────
  // EDITOR VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === "editor") {
    return (
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <DashboardActionButton
              startIcon={
                <ChevronRight
                  size={14}
                  style={{ transform: "rotate(180deg)" }}
                />
              }
              onClick={() => setView("list")}
              variant="text"
              sx={{ fontWeight: 500, fontSize: "0.85rem" }}
            >
              All Menus
            </DashboardActionButton>
            <Typography sx={{ color: mutedColor, fontSize: "0.85rem" }}>
              /
            </Typography>
            <Typography
              sx={{ color: textColor, fontWeight: 600, fontSize: "0.95rem" }}
            >
              {editingMenu?.name || "Edit Menu"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <DashboardCancelButton onClick={() => setView("list")}>
              Discard
            </DashboardCancelButton>
            <DashboardGradientButton
              onClick={handleSave}
              disabled={saveLoading}
              startIcon={
                saveLoading ? (
                  <CircularProgress size={14} />
                ) : (
                  <Check size={14} />
                )
              }
            >
              Save Menu
            </DashboardGradientButton>
          </Stack>
        </Stack>

        {saveError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* Menu name */}
        <Box sx={{ ...card, p: 2.5 }}>
          <Typography
            sx={{
              color: mutedColor,
              fontSize: "0.78rem",
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Menu Title
          </Typography>
          <DashboardInput
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            placeholder="e.g. Main Navigation"
            fullWidth
          />
        </Box>

        {/* Two-column editor */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 380px" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          {/* Left — current items */}
          <Box sx={{ ...card, p: 2.5 }}>
            <Typography
              sx={{
                color: mutedColor,
                fontSize: "0.78rem",
                fontWeight: 600,
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Menu Items ({menuItems.length})
            </Typography>

            {menuItems.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
                <ListTree size={32} color={mutedColor} />
                <Typography
                  sx={{
                    color: mutedColor,
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  No items yet. Add pages, sections, or custom links from the
                  panel.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1}>
                {menuItems.map((item, idx) => {
                  const meta = TYPE_META[item.type] ?? TYPE_META.custom;
                  const isEditing = inlineEdit === item.id;

                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 1.2,
                        borderRadius: "12px",
                        bgcolor: isDark
                          ? alpha("#fff", 0.04)
                          : alpha("#000", 0.02),
                        border: `1px solid ${dividerColor}`,
                        transition: "border-color 0.15s",
                        "&:hover": { borderColor: alpha(accentColor, 0.4) },
                      }}
                    >
                      {/* Drag grip (visual only) */}
                      <GripVertical
                        size={15}
                        color={mutedColor}
                        style={{ cursor: "grab", flexShrink: 0 }}
                      />

                      {/* Type icon */}
                      <Box
                        sx={{
                          color: accentColor,
                          flexShrink: 0,
                          display: "flex",
                        }}
                      >
                        <meta.Icon size={15} />
                      </Box>

                      {/* Label / inline edit */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {isEditing ? (
                          <DashboardInput
                            value={inlineLabel}
                            onChange={(e) => setInlineLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitInlineEdit(item.id);
                              if (e.key === "Escape") setInlineEdit(null);
                            }}
                            onBlur={() => commitInlineEdit(item.id)}
                            autoFocus
                            size="small"
                            sx={{ py: 0 }}
                          />
                        ) : (
                          <Stack>
                            <Typography
                              sx={{
                                color: textColor,
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                lineHeight: 1.2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              sx={{
                                color: mutedColor,
                                fontSize: "0.75rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.target}
                            </Typography>
                          </Stack>
                        )}
                      </Box>

                      {/* Type chip */}
                      <Chip
                        label={meta.label}
                        size="small"
                        sx={{
                          fontSize: "0.67rem",
                          height: 20,
                          bgcolor: alpha(accentColor, 0.12),
                          color: accentColor,
                          fontWeight: 700,
                          border: "none",
                          flexShrink: 0,
                        }}
                      />

                      {/* Actions */}
                      <Stack
                        direction="row"
                        spacing={0.3}
                        sx={{ flexShrink: 0 }}
                      >
                        <DashboardActionButton
                          size="small"
                          sx={{ minWidth: 0, p: "4px 6px" }}
                          disabled={idx === 0}
                          onClick={() => moveItem(item.id, "up")}
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </DashboardActionButton>
                        <DashboardActionButton
                          size="small"
                          sx={{ minWidth: 0, p: "4px 6px" }}
                          disabled={idx === menuItems.length - 1}
                          onClick={() => moveItem(item.id, "down")}
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </DashboardActionButton>
                        <DashboardActionButton
                          size="small"
                          sx={{ minWidth: 0, p: "4px 6px" }}
                          onClick={() => {
                            setInlineEdit(item.id);
                            setInlineLabel(item.label);
                          }}
                          title="Rename"
                        >
                          <Pencil size={13} />
                        </DashboardActionButton>
                        <DashboardActionButton
                          size="small"
                          sx={{
                            minWidth: 0,
                            p: "4px 6px",
                            color: "#ef4444",
                            "&:hover": {
                              color: "#ef4444",
                              bgcolor: alpha("#ef4444", 0.08),
                            },
                          }}
                          onClick={() => removeItem(item.id)}
                          title="Remove"
                        >
                          <X size={13} />
                        </DashboardActionButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Right — add item panel */}
          <Box sx={{ ...card, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
              <Typography
                sx={{
                  color: mutedColor,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 1.5,
                }}
              >
                Add Items
              </Typography>
              <Tabs
                value={addTab}
                onChange={(_, v) => setAddTab(v)}
                variant="fullWidth"
                sx={{
                  minHeight: 36,
                  bgcolor: panelBg,
                  borderRadius: "10px",
                  p: "3px",
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTab-root": {
                    minHeight: 30,
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: mutedColor,
                    borderRadius: "8px",
                    transition: "all 0.15s",
                  },
                  "& .Mui-selected": {
                    color: `${textColor} !important`,
                    bgcolor: isDark ? alpha("#fff", 0.1) : "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Tab
                  icon={<FileText size={13} />}
                  iconPosition="start"
                  label="Pages"
                />
                <Tab
                  icon={<Layers size={13} />}
                  iconPosition="start"
                  label="Sections"
                />
                <Tab
                  icon={<ExternalLink size={13} />}
                  iconPosition="start"
                  label="Custom URL"
                />
              </Tabs>
            </Box>

            <Divider sx={{ borderColor: dividerColor }} />

            {/* Pages panel */}
            {addTab === 0 && (
              <Box sx={{ p: 2, maxHeight: 400, overflowY: "auto" }}>
                {pagesLoading ? (
                  <Stack spacing={1}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        height={44}
                        sx={{ borderRadius: "10px" }}
                      />
                    ))}
                  </Stack>
                ) : pages.length === 0 ? (
                  <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                    <FileText size={28} color={mutedColor} />
                    <Typography
                      sx={{
                        color: mutedColor,
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      No pages found. Create pages first.
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={0.8}>
                    {pages.map((page) => (
                      <Box
                        key={page.id}
                        onClick={() =>
                          addItem({
                            label: page.title || page.name || page.path,
                            type: "page",
                            target: page.path || "/",
                          })
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1.5,
                          py: 1,
                          borderRadius: "10px",
                          cursor: "pointer",
                          border: `1px solid transparent`,
                          transition: "all 0.15s",
                          "&:hover": {
                            bgcolor: alpha(accentColor, 0.08),
                            borderColor: alpha(accentColor, 0.25),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.2}
                        >
                          {page.isHome ? (
                            <Box sx={{ color: accentColor, display: "flex" }}>
                              <FileText size={14} />
                            </Box>
                          ) : (
                            <FileText size={14} color={mutedColor} />
                          )}
                          <Box>
                            <Typography
                              sx={{
                                color: textColor,
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                lineHeight: 1.2,
                              }}
                            >
                              {page.title || page.name || "Untitled"}
                              {page.isHome && (
                                <Chip
                                  label="Home"
                                  size="small"
                                  sx={{
                                    ml: 0.8,
                                    height: 16,
                                    fontSize: "0.62rem",
                                    bgcolor: alpha(accentColor, 0.12),
                                    color: accentColor,
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Typography>
                            <Typography
                              sx={{ color: mutedColor, fontSize: "0.73rem" }}
                            >
                              {page.path}
                            </Typography>
                          </Box>
                        </Stack>
                        <Plus size={14} color={accentColor} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Sections panel */}
            {addTab === 1 && (
              <Box sx={{ p: 2, maxHeight: 400, overflowY: "auto" }}>
                {sectionsLoading ? (
                  <Stack spacing={1}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        height={44}
                        sx={{ borderRadius: "10px" }}
                      />
                    ))}
                  </Stack>
                ) : sections.length === 0 ? (
                  <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
                    <Layers size={28} color={mutedColor} />
                    <Typography
                      sx={{
                        color: mutedColor,
                        fontSize: "0.85rem",
                        textAlign: "center",
                      }}
                    >
                      No sections found. Your template sections will appear here
                      for single-page navigation.
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={0.8}>
                    {sections.map((section) => (
                      <Box
                        key={section.id}
                        onClick={() =>
                          addItem({
                            label: section.label || section.name,
                            type: "section",
                            target: section.anchor || `#${section.id}`,
                          })
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1.5,
                          py: 1,
                          borderRadius: "10px",
                          cursor: "pointer",
                          border: `1px solid transparent`,
                          transition: "all 0.15s",
                          "&:hover": {
                            bgcolor: alpha(accentColor, 0.08),
                            borderColor: alpha(accentColor, 0.25),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.2}
                        >
                          <Layers size={14} color={mutedColor} />
                          <Box>
                            <Typography
                              sx={{
                                color: textColor,
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                lineHeight: 1.2,
                              }}
                            >
                              {section.label || section.name}
                            </Typography>
                            <Typography
                              sx={{ color: mutedColor, fontSize: "0.73rem" }}
                            >
                              {section.anchor || `#${section.id}`}
                            </Typography>
                          </Box>
                        </Stack>
                        <Plus size={14} color={accentColor} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Custom URL panel */}
            {addTab === 2 && (
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      sx={{
                        color: mutedColor,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        mb: 0.7,
                      }}
                    >
                      Label
                    </Typography>
                    <DashboardInput
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g. Contact Us"
                      fullWidth
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: mutedColor,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        mb: 0.7,
                      }}
                    >
                      URL
                    </Typography>
                    <DashboardInput
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                      placeholder="https://example.com or /about"
                      fullWidth
                    />
                  </Box>
                  <DashboardGradientButton
                    fullWidth
                    disabled={!customLabel.trim() || !customTarget.trim()}
                    onClick={() => {
                      addItem({
                        label: customLabel.trim(),
                        type: "custom",
                        target: customTarget.trim(),
                      });
                      setCustomLabel("");
                      setCustomTarget("");
                    }}
                    startIcon={<Plus size={14} />}
                  >
                    Add to Menu
                  </DashboardGradientButton>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: textColor, fontWeight: 700, fontSize: "1.1rem" }}
          >
            Menus
          </Typography>
          <Typography sx={{ color: mutedColor, fontSize: "0.85rem", mt: 0.3 }}>
            Manage navigation menus for your website
          </Typography>
        </Box>
        <DashboardGradientButton
          startIcon={<Plus size={14} />}
          onClick={() => {
            setCreateDialogOpen(true);
            setNewMenuName("");
            setCreateError(null);
          }}
        >
          Create Menu
        </DashboardGradientButton>
      </Stack>

      {listError && (
        <Alert
          severity="error"
          onClose={() => setListError(null)}
          sx={{ borderRadius: 2 }}
        >
          {listError}
        </Alert>
      )}

      {/* Menus list */}
      {listLoading ? (
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={72}
              sx={{ borderRadius: "16px" }}
            />
          ))}
        </Stack>
      ) : menus.length === 0 ? (
        <EmptyState
          icon={<Menu size={36} color="white" />}
          title="No menus yet"
          description="Create your first navigation menu. You can add pages, section anchors, and custom links."
          action={
            <DashboardGradientButton
              startIcon={<Plus size={14} />}
              onClick={() => {
                setCreateDialogOpen(true);
                setNewMenuName("");
                setCreateError(null);
              }}
            >
              Create Menu
            </DashboardGradientButton>
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {menus.map((menu) => (
            <Box
              key={menu.id}
              sx={{
                ...card,
                px: 2.5,
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                transition: "border-color 0.15s",
                "&:hover": { borderColor: alpha(accentColor, 0.35) },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.8}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    bgcolor: alpha(accentColor, 0.12),
                    display: "grid",
                    placeItems: "center",
                    color: accentColor,
                    flexShrink: 0,
                  }}
                >
                  <ListTree size={18} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: textColor,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {menu.name}
                  </Typography>
                  <Typography
                    sx={{ color: mutedColor, fontSize: "0.8rem", mt: 0.2 }}
                  >
                    {Array.isArray(menu.items) ? menu.items.length : 0} item
                    {Array.isArray(menu.items) && menu.items.length !== 1
                      ? "s"
                      : ""}
                    {menu.handle ? ` · ${menu.handle}` : ""}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <DashboardActionButton
                  startIcon={<Pencil size={13} />}
                  onClick={() => openEditor(menu)}
                >
                  Edit
                </DashboardActionButton>
                <DashboardActionButton
                  startIcon={<Trash2 size={13} />}
                  onClick={() => setDeleteTarget(menu)}
                  sx={{
                    color: "#ef4444",
                    "&:hover": { bgcolor: alpha("#ef4444", 0.08) },
                  }}
                >
                  Delete
                </DashboardActionButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* ── Create dialog ────────────────────────────────────────────────── */}
      {createDialogOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateDialogOpen(false);
          }}
        >
          <Box
            sx={{
              ...card,
              p: 3,
              width: "100%",
              maxWidth: 440,
              mx: 2,
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2.5}
            >
              <Typography
                sx={{ color: textColor, fontWeight: 700, fontSize: "1rem" }}
              >
                Create Menu
              </Typography>
              <DashboardActionButton
                size="small"
                sx={{ minWidth: 0, p: "4px" }}
                onClick={() => setCreateDialogOpen(false)}
              >
                <X size={16} />
              </DashboardActionButton>
            </Stack>

            {createError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {createError}
              </Alert>
            )}

            <Typography
              sx={{
                color: mutedColor,
                fontSize: "0.8rem",
                fontWeight: 600,
                mb: 0.7,
              }}
            >
              Menu Name
            </Typography>
            <DashboardInput
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="e.g. Main Navigation"
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />

            <Stack
              direction="row"
              spacing={1.2}
              justifyContent="flex-end"
              mt={2.5}
            >
              <DashboardCancelButton onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </DashboardCancelButton>
              <DashboardGradientButton
                onClick={handleCreate}
                disabled={!newMenuName.trim() || createLoading}
                startIcon={
                  createLoading ? (
                    <CircularProgress size={13} />
                  ) : (
                    <Plus size={13} />
                  )
                }
              >
                Create
              </DashboardGradientButton>
            </Stack>
          </Box>
        </Box>
      )}

      {/* ── Delete confirm dialog ────────────────────────────────────────── */}
      {deleteTarget && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <Box
            sx={{
              ...card,
              p: 3,
              width: "100%",
              maxWidth: 400,
              mx: 2,
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
          >
            <Typography
              sx={{
                color: textColor,
                fontWeight: 700,
                fontSize: "1rem",
                mb: 1,
              }}
            >
              Delete Menu
            </Typography>
            <Typography
              sx={{
                color: mutedColor,
                fontSize: "0.88rem",
                lineHeight: 1.6,
                mb: 2.5,
              }}
            >
              Are you sure you want to delete{" "}
              <b style={{ color: textColor }}>"{deleteTarget.name}"</b>? This
              cannot be undone.
            </Typography>
            <Stack direction="row" spacing={1.2} justifyContent="flex-end">
              <DashboardCancelButton onClick={() => setDeleteTarget(null)}>
                Cancel
              </DashboardCancelButton>
              <DashboardConfirmButton
                onClick={handleDelete}
                disabled={deleteLoading}
                tone="danger"
              >
                Delete
              </DashboardConfirmButton>
            </Stack>
          </Box>
        </Box>
      )}
    </Stack>
  );
});

MenusTab.displayName = "MenusTab";
export default MenusTab;
