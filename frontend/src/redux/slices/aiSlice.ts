import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AIConversation, AIMessage, SuggestedQuestion } from '../../types/ai.types';
import { aiService } from '../../services/ai.service';

interface AIState {
  conversations: AIConversation[];
  activeConversationId: string | null;
  isGenerating: boolean;
  error: string | null;
  sidebarOpen: boolean;
  referencePanelOpen: boolean;
}

const initialState: AIState = {
  conversations: [],
  activeConversationId: null,
  isGenerating: false,
  error: null,
  sidebarOpen: true,
  referencePanelOpen: false,
};

/* ---- Thunks ---- */

export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (
    { conversationId, prompt }: { conversationId: string; prompt: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await aiService.generateResponse(prompt);
      return { conversationId, response };
    } catch {
      return rejectWithValue('AI service unavailable. Please try again.');
    }
  }
);

export const createConversation = createAsyncThunk(
  'ai/createConversation',
  async (title?: string) => {
    return aiService.createConversation(title);
  }
);

/* ---- Slice ---- */

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload;
    },
    addUserMessage(state, action: PayloadAction<{ conversationId: string; message: AIMessage }>) {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv) {
        conv.messages.push(action.payload.message);
        conv.messageCount++;
        conv.updatedAt = new Date().toISOString();
      }
    },
    updateStreamedContent(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; partial: string }>
    ) {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv) {
        const msg = conv.messages.find((m) => m.id === action.payload.messageId);
        if (msg) msg.streamedContent = action.payload.partial;
      }
    },
    finalizeMessage(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; message: AIMessage }>
    ) {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv) {
        const idx = conv.messages.findIndex((m) => m.id === action.payload.messageId);
        if (idx !== -1) conv.messages[idx] = action.payload.message;
        conv.updatedAt = new Date().toISOString();
      }
    },
    toggleBookmark(state, action: PayloadAction<{ conversationId: string; messageId: string }>) {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv) {
        const msg = conv.messages.find((m) => m.id === action.payload.messageId);
        if (msg) msg.isBookmarked = !msg.isBookmarked;
      }
    },
    deleteConversation(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?.id ?? null;
      }
    },
    renameConversation(state, action: PayloadAction<{ id: string; title: string }>) {
      const conv = state.conversations.find((c) => c.id === action.payload.id);
      if (conv) conv.title = action.payload.title;
    },
    clearConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) { conv.messages = []; conv.messageCount = 0; }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleReferencePanel(state) {
      state.referencePanelOpen = !state.referencePanelOpen;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isGenerating = false;
        const { conversationId, response } = action.payload;
        const conv = state.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.messages.push(response);
          conv.messageCount++;
          conv.updatedAt = new Date().toISOString();
          if (conv.messages.length === 2) {
            // Auto-title from first user message
            const firstUser = conv.messages.find((m) => m.role === 'user');
            if (firstUser) conv.title = firstUser.content.slice(0, 60);
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveConversation, addUserMessage, updateStreamedContent,
  finalizeMessage, toggleBookmark, deleteConversation, renameConversation,
  clearConversation, toggleSidebar, toggleReferencePanel, clearError,
} = aiSlice.actions;

export default aiSlice.reducer;

/* ---- Selectors ---- */

export const selectActiveConversation = (conversations: AIConversation[], id: string | null) =>
  conversations.find((c) => c.id === id) ?? null;

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: 'sq-1', label: 'Explain today\'s critical CVEs', icon: '🔍', category: 'cve', prompt: 'Summarize the most critical CVEs detected today and explain their potential impact on enterprise systems.' },
  { id: 'sq-2', label: 'Analyze LockBit ransomware TTPs', icon: '🔒', category: 'ransomware', prompt: 'Provide a detailed MITRE ATT&CK analysis of LockBit ransomware tactics, techniques, and procedures.' },
  { id: 'sq-3', label: 'Investigate malware IOC', icon: '🛡️', category: 'ioc', prompt: 'Analyze the IOC 185.220.101.47 and provide threat attribution, reputation, geolocation, and recommended mitigations.' },
  { id: 'sq-4', label: 'Show active ransomware campaigns', icon: '📊', category: 'ransomware', prompt: 'List all currently active ransomware campaigns, their threat actors, target industries, and initial access vectors.' },
  { id: 'sq-5', label: 'Generate Sigma detection rule', icon: '📝', category: 'malware', prompt: 'Generate a Sigma detection rule for LockBit v9 Loader that detects scheduled task persistence mechanisms.' },
  { id: 'sq-6', label: 'Summarize phishing campaign', icon: '🎣', category: 'phishing', prompt: 'Summarize the SSO Harvest 2026 phishing campaign including TTPs, targeted domains, and recommended email filtering rules.' },
  { id: 'sq-7', label: 'Create mitigation plan', icon: '🛡️', category: 'general', prompt: 'Generate a comprehensive mitigation plan for an enterprise that has been targeted by the Aviation Infrastructure LockDown campaign.' },
  { id: 'sq-8', label: 'Explain APT29 techniques', icon: '🕵️', category: 'malware', prompt: 'Explain the primary attack techniques used by APT29 (Cozy Bear) and how defenders can detect and mitigate them.' },
];
