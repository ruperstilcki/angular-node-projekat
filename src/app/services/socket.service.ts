import { Injectable, signal, WritableSignal, inject, DestroyRef } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { PostService } from './post.service';

// Structure for messages coming from the backend
interface ServerMessage {
  type: string;   // event type, e.g. 'post-created'
  payload: any;   // actual event data, e.g. a new post object
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: Socket;

  // Writable signal that stores the last received server message
  public messageSignal: WritableSignal<ServerMessage | null> = signal<ServerMessage | null>(null);

  // Keep the ID of this socket instance (used to avoid self-updates)
  public clientId: string | null = null;

  private readonly postService: PostService = inject(PostService);

  private readonly destroyRef = inject(DestroyRef); // Inject DestroyRef

  constructor() {
    // 👇 Connect to your backend WebSocket server
    this.socket = io('http://localhost:3000' /*'https://angular-node-projekat.onrender.com' */, {
      transports: ['websocket'],     // use only WebSocket transport
      reconnection: true,            // automatically try to reconnect
      reconnectionAttempts: 5,       // number of reconnection attempts
      reconnectionDelay: 2000        // delay between attempts (ms)
    });

    // ✅ When connected successfully
    this.socket.on('connect', () => {
      this.clientId = this.socket.id ?? null;
      console.log('✅ Connected to websocket server with id:', this.socket.id);
    });

    // ✅ When a new message/event is received from backend
    this.socket.on('serverEvent', (data: ServerMessage) => {
      console.log('📨 Received event from server:', data);
      this.messageSignal.set(data); // update signal so components react
    });

    // ✅ When disconnected
    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    this.socket.on('postCreated', (post) => {
      if (post.createdBy === this.clientId) return; // skip if it's from self
      this.postService.fetchInitialPosts(); // refetch posts from backend
    });

    this.socket.on('postEdited', (post) => {
      if (post.createdBy === this.clientId) return; // skip if it's from self
      this.postService.fetchInitialPosts(); // refetch posts from backend
    });
  }

  /**
   * 📤 Send a message/event to backend
   * @param type - event type (e.g. 'create-post')
   * @param payload - message body (e.g. new post object)
   */
  sendMessage(type: string, payload: any) {
    this.socket.emit('clientEvent', { type, payload });
  }

  /**
   * 🧭 Getter for accessing the socket directly if needed
   */
  getSocket(): Socket {
    return this.socket;
  }

  /**
   * 🆔 Returns current client socket ID (used for filtering)
   */
  getClientId(): string | null {
    return this.clientId;
  }
}
