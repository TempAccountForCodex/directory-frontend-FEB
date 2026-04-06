/**
 * WebSocket Message Type Definitions
 *
 * TypeScript interfaces and discriminated unions for the
 * WebSocket message protocol (Step 5.3.4).
 *
 * API contract: ws://localhost:5000?token={jwt}
 * Message format: { type, roomId?, data?, timestamp?, userId? }
 */

// ---------------------------------------------------------------------------
// Connection state
// ---------------------------------------------------------------------------

export type WebSocketConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

// ---------------------------------------------------------------------------
// Message type literals
// ---------------------------------------------------------------------------

export type WebSocketMessageType =
  | "JOIN_ROOM"
  | "LEAVE_ROOM"
  | "USER_JOINED"
  | "USER_LEFT"
  | "CONTENT_UPDATE"
  | "CURSOR_MOVE"
  | "LOCK_ACQUIRE"
  | "LOCK_RELEASE"
  | "ERROR"
  | "ROOM_STATE"
  | "USER_METADATA"
  | "LOCK_ACQUIRED"
  | "LOCK_RELEASED";

// ---------------------------------------------------------------------------
// Base interface
// ---------------------------------------------------------------------------

export interface WebSocketMessage {
  type: WebSocketMessageType;
  roomId?: string;
  userId?: number;
  data?: Record<string, unknown>;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Specific data shapes
// ---------------------------------------------------------------------------

export interface ContentUpdateData {
  blockId: number;
  fieldPath: string;
  value: unknown;
}

export interface CursorMoveData {
  blockId: number;
  x: number;
  y: number;
}

export interface LockData {
  blockId: number;
  fieldPath?: string;
  userName?: string;
  username?: string;
  role?: string;
}

export interface RoomStateMember {
  userId: number;
  username: string;
  avatar?: string | null;
}

/** User metadata received on WS handshake (Step 5.8) */
export interface UserMetadata {
  userId: number;
  name: string | null;
  avatar: string | null;
}

export interface RoomStateData {
  members: RoomStateMember[];
  roomId: string;
}

export interface ErrorData {
  code?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Discriminated union types for each message
// ---------------------------------------------------------------------------

export interface JoinRoomMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "JOIN_ROOM";
  roomId: string;
  data?: Record<string, unknown>;
}

export interface LeaveRoomMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "LEAVE_ROOM";
  roomId: string;
  data?: Record<string, unknown>;
}

export interface UserJoinedMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "USER_JOINED";
  roomId: string;
  userId: number;
  data?: Record<string, unknown>;
}

export interface UserLeftMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "USER_LEFT";
  roomId: string;
  userId: number;
  data?: Record<string, unknown>;
}

export interface ContentUpdateMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "CONTENT_UPDATE";
  data: ContentUpdateData & Record<string, unknown>;
}

export interface CursorMoveMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "CURSOR_MOVE";
  data: CursorMoveData & Record<string, unknown>;
}

export interface LockAcquireMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "LOCK_ACQUIRE";
  data: LockData & Record<string, unknown>;
}

export interface LockReleaseMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "LOCK_RELEASE";
  data: LockData & Record<string, unknown>;
}

export interface LockAcquiredMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "LOCK_ACQUIRED";
  data: LockData & Record<string, unknown>;
}

export interface LockReleasedMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "LOCK_RELEASED";
  data: LockData & Record<string, unknown>;
}

export interface ErrorMessage extends Omit<WebSocketMessage, "type" | "data"> {
  type: "ERROR";
  data: ErrorData & Record<string, unknown>;
}

export interface RoomStateMessage extends Omit<
  WebSocketMessage,
  "type" | "data"
> {
  type: "ROOM_STATE";
  roomId: string;
  data: RoomStateData & Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Type guard functions — validate and narrow without unsafe `as` assertion
// ---------------------------------------------------------------------------

export function isContentUpdate(
  msg: WebSocketMessage,
): msg is ContentUpdateMessage {
  if (msg.type !== "CONTENT_UPDATE") return false;
  const d = msg.data;
  if (!d) return false;
  return typeof d.blockId === "number" && typeof d.fieldPath === "string";
}

export function isCursorMove(msg: WebSocketMessage): msg is CursorMoveMessage {
  if (msg.type !== "CURSOR_MOVE") return false;
  const d = msg.data;
  if (!d) return false;
  return (
    typeof d.blockId === "number" &&
    typeof d.x === "number" &&
    typeof d.y === "number"
  );
}

export function isLockMessage(
  msg: WebSocketMessage,
): msg is
  | LockAcquireMessage
  | LockReleaseMessage
  | LockAcquiredMessage
  | LockReleasedMessage {
  if (
    msg.type !== "LOCK_ACQUIRE" &&
    msg.type !== "LOCK_RELEASE" &&
    msg.type !== "LOCK_ACQUIRED" &&
    msg.type !== "LOCK_RELEASED"
  )
    return false;
  const d = msg.data;
  if (!d) return false;
  return typeof d.blockId === "number";
}

export function isRoomState(msg: WebSocketMessage): msg is RoomStateMessage {
  if (msg.type !== "ROOM_STATE") return false;
  const d = msg.data as Record<string, unknown> | undefined;
  if (d === undefined) return false;
  const rd = d as Partial<RoomStateData>;
  return typeof rd.roomId === "string" && Array.isArray(rd.members);
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseWebSocketReturn {
  connectionState: WebSocketConnectionState;
  send: (message: Omit<WebSocketMessage, "timestamp" | "userId">) => boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  leaveAllRooms: () => void;
  connectedUsers: number;
  reconnectAttempt: number;
  /** User metadata received from server handshake (Step 5.8) */
  userMetadata: UserMetadata | null;
}
