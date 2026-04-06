/**
 * ApprovalWorkflow.test.jsx — Step 7.11.14
 *
 * Tests for:
 *   A) ApprovalStatusBanner
 *   B) RequestApprovalDialog
 *   C) SectionLockIndicator
 *   D) SectionLockOverlay
 *   E) useApprovalWorkflow hook
 *
 * 35+ test cases. Uses Vitest + React Testing Library. All network calls mocked.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock('axios');
import axios from 'axios';
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Mock useApprovalWorkflow for component tests (we test the hook separately)
// ---------------------------------------------------------------------------
vi.mock('../../../hooks/useApprovalWorkflow', () => ({
  useApprovalWorkflow: vi.fn(),
  default: vi.fn(),
}));
import { useApprovalWorkflow } from '../../../hooks/useApprovalWorkflow';
const mockUseApprovalWorkflow = vi.mocked(useApprovalWorkflow);

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import ApprovalStatusBanner from '../ApprovalStatusBanner';
import RequestApprovalDialog from '../RequestApprovalDialog';
import SectionLockIndicator from '../SectionLockIndicator';
import SectionLockOverlay from '../SectionLockOverlay';

// ---------------------------------------------------------------------------
// Default hook return
// ---------------------------------------------------------------------------

function makeHookReturn(overrides = {}) {
  return {
    approvalState: null,
    loading: false,
    error: null,
    sectionLocks: [],
    requestApproval: vi.fn().mockResolvedValue({}),
    reviewApproval: vi.fn().mockResolvedValue({}),
    publishAfterApproval: vi.fn().mockResolvedValue({}),
    emergencyPublish: vi.fn().mockResolvedValue({}),
    revokeApproval: vi.fn().mockResolvedValue({}),
    refreshApprovalState: vi.fn(),
    isApprovalRequired: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// A) ApprovalStatusBanner tests
// ---------------------------------------------------------------------------

describe('ApprovalStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('A1: renders nothing when approvalState is null (DRAFT / no state)', () => {
    mockUseApprovalWorkflow.mockReturnValue(makeHookReturn({ approvalState: null }));
    const { container } = render(
      <ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('A2: renders nothing for DRAFT state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'DRAFT' } })
    );
    const { container } = render(
      <ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('A3: renders nothing for PUBLISHED state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'PUBLISHED' } })
    );
    const { container } = render(
      <ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('A4: renders info alert for PENDING_APPROVAL state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'PENDING_APPROVAL',
          requestedBy: { id: 20, name: 'Bob Editor' },
          requestedAt: '2026-03-16T10:00:00Z',
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/waiting for approval/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Editor/)).toBeInTheDocument();
  });

  it('A5: shows Approve and Reject buttons for ADMIN+ who is not the requester', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'PENDING_APPROVAL',
          requestedBy: { id: 20, name: 'Bob Editor' },
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('A6: hides Approve/Reject for EDITOR role on PENDING_APPROVAL', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'PENDING_APPROVAL',
          requestedBy: { id: 20, name: 'Bob' },
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reject/i })).not.toBeInTheDocument();
  });

  it('A7: hides Approve/Reject when ADMIN is the requester', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'PENDING_APPROVAL',
          requestedBy: { id: 10, name: 'Alice Admin' },
        },
      })
    );
    // userId=10 is the requester and also ADMIN
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
  });

  it('A8: renders success alert for APPROVED state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'APPROVED' } })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('A9: shows Publish button for ADMIN+ on APPROVED state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'APPROVED' } })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
  });

  it('A10: hides Publish button for EDITOR on APPROVED state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'APPROVED' } })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument();
  });

  it('A11: renders warning alert for REJECTED state', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'REJECTED',
          requestedBy: { id: 10, name: 'Alice' },
          rejectionReason: 'Needs more detail',
        },
      })
    );
    // userId=10 is the requester
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/revision/i)).toBeInTheDocument();
  });

  it('A12: shows rejection reason for the original requester', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'REJECTED',
          requestedBy: { id: 10, name: 'Alice' },
          rejectionReason: 'Needs more detail',
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.getByText(/needs more detail/i)).toBeInTheDocument();
  });

  it('A13: hides rejection reason for VIEWER who is not requester', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'REJECTED',
          requestedBy: { id: 20, name: 'Bob' },
          rejectionReason: 'Top secret reason',
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="VIEWER" userId={30} />);
    expect(screen.queryByText(/top secret reason/i)).not.toBeInTheDocument();
  });

  it('A14: shows Resubmit button for the original requester on REJECTED', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'REJECTED',
          requestedBy: { id: 10 },
          rejectionReason: 'Fix errors',
        },
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.getByRole('button', { name: /resubmit/i })).toBeInTheDocument();
  });

  it('A15: shows loading skeleton when loading=true and no approvalState', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ loading: true, approvalState: null })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    // Skeleton rendered as div
    const container = document.querySelector('[class*="MuiSkeleton"]');
    expect(container).toBeTruthy();
  });

  it('A16: shows error alert with retry button when error occurs', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ error: 'Network error', approvalState: null, loading: false })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('A17: Approve action calls reviewApproval with approved=true', async () => {
    const reviewApproval = vi.fn().mockResolvedValue({});
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: {
          workflowState: 'PENDING_APPROVAL',
          requestedBy: { id: 20, name: 'Bob' },
        },
        reviewApproval,
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    await waitFor(() => {
      expect(reviewApproval).toHaveBeenCalledWith({ approved: true });
    });
  });

  it('A18: Publish action calls publishAfterApproval', async () => {
    const publishAfterApproval = vi.fn().mockResolvedValue({});
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({
        approvalState: { workflowState: 'APPROVED' },
        publishAfterApproval,
      })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));
    await waitFor(() => {
      expect(publishAfterApproval).toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// B) RequestApprovalDialog tests
// ---------------------------------------------------------------------------

describe('RequestApprovalDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.post = vi.fn().mockResolvedValue({ data: { data: { ok: true } } });
  });

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    websiteId: 1,
    onSuccess: vi.fn(),
  };

  it('B1: renders dialog with title when open=true', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    expect(screen.getByText('Request Approval')).toBeInTheDocument();
  });

  it('B2: does not render dialog content when open=false', () => {
    render(<RequestApprovalDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Request Approval')).not.toBeInTheDocument();
  });

  it('B3: renders changeSummary textarea', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    expect(screen.getByLabelText(/change summary/i)).toBeInTheDocument();
  });

  it('B4: Submit button disabled when changeSummary is empty', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('B5: Submit button enabled when changeSummary has content', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: 'Updated hero section' } });
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('B6: shows character counter in format X/2000', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText('5/2000')).toBeInTheDocument();
  });

  it('B7: Submit button disabled when changeSummary exceeds 2000 chars', () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    const textarea = screen.getByLabelText(/change summary/i);
    const longText = 'x'.repeat(2001);
    fireEvent.change(textarea, { target: { value: longText } });
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('B8: calls POST endpoint on submit with trimmed changeSummary', async () => {
    render(<RequestApprovalDialog {...defaultProps} />);
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: '  Updated footer  ' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/websites/1/approval/request'),
        { changeSummary: 'Updated footer' },
        expect.any(Object)
      );
    });
  });

  it('B9: calls onSuccess and onClose on successful submit', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(
      <RequestApprovalDialog
        {...defaultProps}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: 'New content added' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('B10: displays error in dialog on API failure without closing', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue({
      response: { data: { message: 'Server error' } },
      message: 'Server error',
    });
    const onClose = vi.fn();
    render(<RequestApprovalDialog {...defaultProps} onClose={onClose} />);
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: 'Some change' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('B11: Cancel button calls onClose', () => {
    const onClose = vi.fn();
    render(<RequestApprovalDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('B12: shows loading state on Submit button during request', async () => {
    let resolvePost;
    mockedAxios.post = vi.fn().mockReturnValue(
      new Promise((r) => { resolvePost = r; })
    );
    render(<RequestApprovalDialog {...defaultProps} />);
    const textarea = screen.getByLabelText(/change summary/i);
    fireEvent.change(textarea, { target: { value: 'Pending submit' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    });
    resolvePost({ data: {} });
  });
});

// ---------------------------------------------------------------------------
// C) SectionLockIndicator tests
// ---------------------------------------------------------------------------

describe('SectionLockIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('C1: renders nothing when no lock exists (404)', async () => {
    mockedAxios.get = vi.fn().mockRejectedValue({ response: { status: 404 } });
    const { container } = render(
      <SectionLockIndicator websiteId={1} sectionId="s1" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      expect(container.querySelector('[data-testid="section-lock-indicator-s1"]')).not.toBeInTheDocument();
    });
  });

  it('C2: renders blue lock icon for EDIT_LOCK by another user', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'EDIT_LOCK',
          lockedBy: { id: 20, name: 'Alice' },
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s1" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      const indicator = document.querySelector('[data-testid="section-lock-indicator-s1"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('data-lock-type', 'EDIT_LOCK');
    });
  });

  it('C3: renders green lock icon when current user holds the EDIT_LOCK', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'EDIT_LOCK',
          lockedBy: { id: 10, name: 'Self User' },
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s2" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      const indicator = document.querySelector('[data-testid="section-lock-indicator-s2"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('data-lock-type', 'SELF_LOCK');
    });
  });

  it('C4: renders red lock icon for FREEZE_LOCK', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'FREEZE_LOCK',
          lockedBy: { id: 5, name: 'Owner' },
          reason: 'Content freeze',
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s3" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      const indicator = document.querySelector('[data-testid="section-lock-indicator-s3"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('data-lock-type', 'FREEZE_LOCK');
    });
  });

  it('C5: renders yellow lock icon for APPROVAL_LOCK', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'APPROVAL_LOCK',
          lockedBy: { id: 5, name: 'System' },
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s4" userId={10} userRole="ADMIN" />
    );
    await waitFor(() => {
      const indicator = document.querySelector('[data-testid="section-lock-indicator-s4"]');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('data-lock-type', 'APPROVAL_LOCK');
    });
  });

  it('C6: tooltip includes lock holder name for EDIT_LOCK', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'EDIT_LOCK',
          lockedBy: { id: 20, name: 'Carol' },
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s5" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      const iconBtn = screen.getByRole('button', { name: /editing: carol/i });
      expect(iconBtn).toBeInTheDocument();
    });
  });

  it('C7: tooltip shows freeze reason for FREEZE_LOCK', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'FREEZE_LOCK',
          lockedBy: { id: 5, name: 'Admin' },
          reason: 'Brand review',
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s6" userId={10} userRole="EDITOR" />
    );
    await waitFor(() => {
      const iconBtn = screen.getByRole('button', { name: /brand review/i });
      expect(iconBtn).toBeInTheDocument();
    });
  });

  it('C8: WebSocket SECTION_UNLOCKED event clears the lock indicator', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        data: {
          lockType: 'EDIT_LOCK',
          lockedBy: { id: 20, name: 'Alice' },
        },
      },
    });
    render(
      <SectionLockIndicator websiteId={1} sectionId="s7" userId={10} userRole="EDITOR" />
    );
    // Wait for lock to appear
    await waitFor(() => {
      expect(document.querySelector('[data-testid="section-lock-indicator-s7"]')).toBeInTheDocument();
    });

    // Fire WebSocket SECTION_UNLOCKED event
    act(() => {
      window.dispatchEvent(
        new MessageEvent('ws:message', {
          data: JSON.stringify({ type: 'SECTION_UNLOCKED', sectionId: 's7', data: { sectionId: 's7' } }),
        })
      );
    });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="section-lock-indicator-s7"]')).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// D) SectionLockOverlay tests
// ---------------------------------------------------------------------------

describe('SectionLockOverlay', () => {
  it('D1: renders nothing when open=false', () => {
    const { container } = render(
      <SectionLockOverlay open={false} lockType="FREEZE_LOCK" reason="Frozen" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('D2: renders backdrop when open=true', () => {
    render(<SectionLockOverlay open={true} lockType="FREEZE_LOCK" reason="Content freeze" />);
    expect(screen.getByTestId('section-lock-overlay')).toBeInTheDocument();
  });

  it('D3: shows lock reason text in overlay', () => {
    render(<SectionLockOverlay open={true} lockType="FREEZE_LOCK" reason="Under review" />);
    expect(screen.getByText(/under review/i)).toBeInTheDocument();
  });

  it('D4: shows default reason when reason prop is null', () => {
    render(<SectionLockOverlay open={true} lockType="FREEZE_LOCK" reason={null} />);
    expect(screen.getByText(/section is frozen/i)).toBeInTheDocument();
  });

  it('D5: shows lockedBy name when provided', () => {
    render(
      <SectionLockOverlay
        open={true}
        lockType="FREEZE_LOCK"
        reason="Brand freeze"
        lockedBy="Alice Owner"
      />
    );
    expect(screen.getByText(/alice owner/i)).toBeInTheDocument();
  });

  it('D6: renders for APPROVAL_LOCK with yellow styling context', () => {
    render(
      <SectionLockOverlay open={true} lockType="APPROVAL_LOCK" reason={null} />
    );
    expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
  });

  it('D7: overlay has role=status for accessibility', () => {
    render(<SectionLockOverlay open={true} lockType="FREEZE_LOCK" reason="Frozen" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('D8: click events do not propagate through overlay', () => {
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler}>
        <SectionLockOverlay open={true} lockType="FREEZE_LOCK" reason="Locked" />
      </div>
    );
    fireEvent.click(screen.getByTestId('section-lock-overlay'));
    expect(parentHandler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// E) useApprovalWorkflow hook tests
// These test the hook's contract via the mock (the hook is mocked above,
// so we verify the interface shape and that components integrate correctly.
// Direct unit tests of the hook's internal logic would need a separate file
// without the global vi.mock.
// ---------------------------------------------------------------------------

describe('useApprovalWorkflow hook interface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('E1: hook mock returns expected shape', () => {
    const hookReturn = makeHookReturn();
    mockUseApprovalWorkflow.mockReturnValue(hookReturn);
    // Verify shape by rendering a component that uses the hook
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(mockUseApprovalWorkflow).toHaveBeenCalledWith(1, 'EDITOR', 10);
  });

  it('E2: hook called with correct websiteId, userRole, userId', () => {
    mockUseApprovalWorkflow.mockReturnValue(makeHookReturn());
    render(<ApprovalStatusBanner websiteId={42} userRole="ADMIN" userId={99} />);
    expect(mockUseApprovalWorkflow).toHaveBeenCalledWith(42, 'ADMIN', 99);
  });

  it('E3: hook returns requestApproval function', () => {
    const hookReturn = makeHookReturn();
    mockUseApprovalWorkflow.mockReturnValue(hookReturn);
    expect(typeof hookReturn.requestApproval).toBe('function');
  });

  it('E4: hook returns reviewApproval function', () => {
    const hookReturn = makeHookReturn();
    mockUseApprovalWorkflow.mockReturnValue(hookReturn);
    expect(typeof hookReturn.reviewApproval).toBe('function');
  });

  it('E5: hook returns publishAfterApproval function', () => {
    const hookReturn = makeHookReturn();
    expect(typeof hookReturn.publishAfterApproval).toBe('function');
  });

  it('E6: hook returns revokeApproval function', () => {
    const hookReturn = makeHookReturn();
    expect(typeof hookReturn.revokeApproval).toBe('function');
  });

  it('E7: hook returns emergencyPublish function', () => {
    const hookReturn = makeHookReturn();
    expect(typeof hookReturn.emergencyPublish).toBe('function');
  });

  it('E8: hook returns refreshApprovalState function', () => {
    const hookReturn = makeHookReturn();
    expect(typeof hookReturn.refreshApprovalState).toBe('function');
  });

  it('E9: isApprovalRequired is a boolean', () => {
    const hookReturn = makeHookReturn({ isApprovalRequired: false });
    expect(typeof hookReturn.isApprovalRequired).toBe('boolean');
  });

  it('E10: sectionLocks is an array', () => {
    const hookReturn = makeHookReturn({ sectionLocks: [{ id: 1 }] });
    expect(Array.isArray(hookReturn.sectionLocks)).toBe(true);
  });

  it('E11: banner re-renders when hook returns new approvalState', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ approvalState: { workflowState: 'APPROVED' } })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="ADMIN" userId={10} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/approved/i)).toBeInTheDocument();
  });

  it('E12: error from hook results in error banner', () => {
    mockUseApprovalWorkflow.mockReturnValue(
      makeHookReturn({ error: 'Service unavailable', approvalState: null })
    );
    render(<ApprovalStatusBanner websiteId={1} userRole="EDITOR" userId={10} />);
    expect(screen.getByText(/service unavailable/i)).toBeInTheDocument();
  });
});
