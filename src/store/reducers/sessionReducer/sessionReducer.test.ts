import sessionReducer, {
  setSessionId,
  sessionError
} from './sessionReducer';
import type { SessionState } from '../../../types/types';

describe('Session Reducer', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Act
      const result = sessionReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toEqual({
        sessionId: '',
        message: { error: '' }
      });
    });

    it('should have correct initial state structure', () => {
      // Act
      const result = sessionReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('message');
      expect(result.message).toHaveProperty('error');
      expect(typeof result.sessionId).toBe('string');
      expect(typeof result.message.error).toBe('string');
    });

    it('should have empty initial values', () => {
      // Act
      const result = sessionReducer(undefined, { type: 'unknown' });

      // Assert
      expect(result.sessionId).toBe('');
      expect(result.message.error).toBe('');
    });
  });

  describe('setSessionId Action', () => {
    it('should set session ID with valid string', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const sessionId = 'session-123-abc-456';

      // Act
      const result = sessionReducer(initialState, setSessionId(sessionId));

      // Assert
      expect(result.sessionId).toBe(sessionId);
      expect(result.message.error).toBe('');
    });

    it('should update existing session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'old-session-id',
        message: { error: 'previous error' }
      };
      const newSessionId = 'new-session-id-789';

      // Act
      const result = sessionReducer(initialState, setSessionId(newSessionId));

      // Assert
      expect(result.sessionId).toBe(newSessionId);
      expect(result.sessionId).not.toBe('old-session-id');
      expect(result.message.error).toBe('previous error'); // Should preserve other state
    });

    it('should set session ID with UUID format', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const uuidSessionId = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const result = sessionReducer(initialState, setSessionId(uuidSessionId));

      // Assert
      expect(result.sessionId).toBe(uuidSessionId);
      expect(result.sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should set session ID with timestamp format', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const timestampSessionId = 'session_1728216000_abc123';

      // Act
      const result = sessionReducer(initialState, setSessionId(timestampSessionId));

      // Assert
      expect(result.sessionId).toBe(timestampSessionId);
      expect(result.sessionId).toContain('1728216000');
      expect(result.sessionId).toContain('abc123');
    });

    it('should set session ID with long string', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const longSessionId = 'very-long-session-id-with-many-characters-and-numbers-1234567890-abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ-special-chars-!@#$%^&*()';

      // Act
      const result = sessionReducer(initialState, setSessionId(longSessionId));

      // Assert
      expect(result.sessionId).toBe(longSessionId);
      expect(result.sessionId.length).toBeGreaterThan(100);
    });

    it('should set empty session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'existing-session-id',
        message: { error: '' }
      };

      // Act
      const result = sessionReducer(initialState, setSessionId(''));

      // Assert
      expect(result.sessionId).toBe('');
      expect(result.message.error).toBe('');
    });

    it('should handle session ID with special characters', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const specialSessionId = 'session_ñáéíóú_漢字_🔐_!@#$%^&*()_±≠≤≥÷';

      // Act
      const result = sessionReducer(initialState, setSessionId(specialSessionId));

      // Assert
      expect(result.sessionId).toBe(specialSessionId);
      expect(result.sessionId).toContain('ñáéíóú');
      expect(result.sessionId).toContain('漢字');
      expect(result.sessionId).toContain('🔐');
    });

    it('should handle numeric string session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const numericSessionId = '1234567890';

      // Act
      const result = sessionReducer(initialState, setSessionId(numericSessionId));

      // Assert
      expect(result.sessionId).toBe(numericSessionId);
      expect(typeof result.sessionId).toBe('string');
      expect(result.sessionId).toBe('1234567890');
    });

    it('should handle base64-like session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const base64SessionId = 'c2Vzc2lvbi1pZC1iYXNlNjQ=';

      // Act
      const result = sessionReducer(initialState, setSessionId(base64SessionId));

      // Assert
      expect(result.sessionId).toBe(base64SessionId);
      expect(result.sessionId).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should handle JWT-like session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const jwtLikeSessionId = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      // Act
      const result = sessionReducer(initialState, setSessionId(jwtLikeSessionId));

      // Assert
      expect(result.sessionId).toBe(jwtLikeSessionId);
      expect(result.sessionId.split('.')).toHaveLength(3);
    });

    it('should maintain immutability when updating session ID', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'old-session',
        message: { error: 'test error' }
      };
      const newSessionId = 'new-session';

      // Act
      const result = sessionReducer(initialState, setSessionId(newSessionId));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.message).toBe(initialState.message); // Should preserve reference if unchanged
      expect(initialState.sessionId).toBe('old-session'); // Original state unchanged
    });
  });

  describe('sessionError Action', () => {
    it('should set error message with valid string', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-123',
        message: { error: '' }
      };
      const errorMessage = 'Session initialization failed';

      // Act
      const result = sessionReducer(initialState, sessionError(errorMessage));

      // Assert
      expect(result.message.error).toBe(errorMessage);
      expect(result.sessionId).toBe('session-123');
    });

    it('should update existing error message', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-456',
        message: { error: 'Old error message' }
      };
      const newErrorMessage = 'New error message';

      // Act
      const result = sessionReducer(initialState, sessionError(newErrorMessage));

      // Assert
      expect(result.message.error).toBe(newErrorMessage);
      expect(result.message.error).not.toBe('Old error message');
      expect(result.sessionId).toBe('session-456');
    });

    it('should clear error message with empty string', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-789',
        message: { error: 'Existing error' }
      };

      // Act
      const result = sessionReducer(initialState, sessionError(''));

      // Assert
      expect(result.message.error).toBe('');
      expect(result.sessionId).toBe('session-789');
    });

    it('should handle long error message', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-long',
        message: { error: '' }
      };
      const longErrorMessage = 'A very long error message that might occur when session initialization fails due to various reasons such as network connectivity issues, server-side errors, authentication problems, database connection failures, or configuration issues that need to be communicated to the user in detail for debugging purposes.';

      // Act
      const result = sessionReducer(initialState, sessionError(longErrorMessage));

      // Assert
      expect(result.message.error).toBe(longErrorMessage);
      expect(result.message.error.length).toBeGreaterThan(200);
      expect(result.sessionId).toBe('session-long');
    });

    it('should handle error message with special characters', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-special',
        message: { error: '' }
      };
      const specialErrorMessage = 'Error: 会话失败 - Échec de session (500) @#$%^&*() 🚫❌';

      // Act
      const result = sessionReducer(initialState, sessionError(specialErrorMessage));

      // Assert
      expect(result.message.error).toBe(specialErrorMessage);
      expect(result.message.error).toContain('会话失败');
      expect(result.message.error).toContain('Échec de session');
      expect(result.message.error).toContain('🚫❌');
    });

    it('should handle JSON-like error message', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-json',
        message: { error: '' }
      };
      const jsonErrorMessage = '{"error": "Session expired", "code": 401, "timestamp": "2025-10-06T14:30:00Z"}';

      // Act
      const result = sessionReducer(initialState, sessionError(jsonErrorMessage));

      // Assert
      expect(result.message.error).toBe(jsonErrorMessage);
      expect(result.message.error).toContain('"error": "Session expired"');
      expect(result.message.error).toContain('"code": 401');
    });

    it('should handle multiline error message', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-multiline',
        message: { error: '' }
      };
      const multilineErrorMessage = `Session Error:
Line 1: Connection failed
Line 2: Timeout after 30 seconds
Line 3: Retrying...`;

      // Act
      const result = sessionReducer(initialState, sessionError(multilineErrorMessage));

      // Assert
      expect(result.message.error).toBe(multilineErrorMessage);
      expect(result.message.error).toContain('Session Error:');
      expect(result.message.error).toContain('Line 1:');
      expect(result.message.error).toContain('Retrying...');
    });

    it('should maintain immutability when updating error message', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'session-immutable',
        message: { error: 'old error' }
      };
      const errorMessage = 'new error';

      // Act
      const result = sessionReducer(initialState, sessionError(errorMessage));

      // Assert
      expect(result).not.toBe(initialState);
      expect(result.message).not.toBe(initialState.message);
      expect(initialState.message.error).toBe('old error'); // Original state unchanged
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle rapid successive actions', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert - Apply multiple actions in sequence
      state = sessionReducer(state, setSessionId('session-1'));
      expect(state.sessionId).toBe('session-1');

      state = sessionReducer(state, sessionError('Error 1'));
      expect(state.message.error).toBe('Error 1');
      expect(state.sessionId).toBe('session-1');

      state = sessionReducer(state, setSessionId('session-2'));
      expect(state.sessionId).toBe('session-2');
      expect(state.message.error).toBe('Error 1');

      state = sessionReducer(state, sessionError('Error 2'));
      expect(state.message.error).toBe('Error 2');
      expect(state.sessionId).toBe('session-2');

      state = sessionReducer(state, sessionError(''));
      expect(state.message.error).toBe('');
      expect(state.sessionId).toBe('session-2');
    });

    it('should handle undefined and null payloads gracefully', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: 'existing-session',
        message: { error: 'existing error' }
      };

      // Act & Assert
      const result1 = sessionReducer(initialState, setSessionId(null as any));
      expect(result1.sessionId).toBeNull();

      const result2 = sessionReducer(initialState, setSessionId(undefined as any));
      expect(result2.sessionId).toBeUndefined();

      const result3 = sessionReducer(initialState, sessionError(null as any));
      expect(result3.message.error).toBeNull();

      const result4 = sessionReducer(initialState, sessionError(undefined as any));
      expect(result4.message.error).toBeUndefined();
    });

    it('should handle session ID rotation scenario', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      const sessionIds = [
        'initial-session-abc123',
        'refreshed-session-def456',
        'renewed-session-ghi789',
        'final-session-jkl012'
      ];

      // Act & Assert - Simulate session rotation
      sessionIds.forEach((sessionId, index) => {
        state = sessionReducer(state, setSessionId(sessionId));
        expect(state.sessionId).toBe(sessionId);
        expect(state.message.error).toBe('');

        if (index > 0) {
          expect(state.sessionId).not.toBe(sessionIds[index - 1]);
        }
      });
    });

    it('should handle error recovery scenario', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert - Simulate error and recovery
      state = sessionReducer(state, setSessionId('session-attempt-1'));
      expect(state.sessionId).toBe('session-attempt-1');

      state = sessionReducer(state, sessionError('Connection failed'));
      expect(state.message.error).toBe('Connection failed');

      state = sessionReducer(state, setSessionId('session-attempt-2'));
      expect(state.sessionId).toBe('session-attempt-2');

      state = sessionReducer(state, sessionError('Timeout error'));
      expect(state.message.error).toBe('Timeout error');

      state = sessionReducer(state, setSessionId('session-success'));
      expect(state.sessionId).toBe('session-success');

      state = sessionReducer(state, sessionError(''));
      expect(state.message.error).toBe('');
      expect(state.sessionId).toBe('session-success');
    });
  });

  describe('Action Creators', () => {
    it('should create correct action types and payloads', () => {
      // Test setSessionId action creator
      expect(setSessionId('test-session-id')).toEqual({
        type: 'session/setSessionId',
        payload: 'test-session-id'
      });

      expect(setSessionId('')).toEqual({
        type: 'session/setSessionId',
        payload: ''
      });

      // Test sessionError action creator
      expect(sessionError('test error message')).toEqual({
        type: 'session/sessionError',
        payload: 'test error message'
      });

      expect(sessionError('')).toEqual({
        type: 'session/sessionError',
        payload: ''
      });
    });

    it('should create actions with complex payloads', () => {
      // Test complex session ID
      const complexSessionId = 'session_550e8400-e29b-41d4-a716-446655440000_2025-10-06T14:30:00Z';
      expect(setSessionId(complexSessionId)).toEqual({
        type: 'session/setSessionId',
        payload: complexSessionId
      });

      // Test complex error message
      const complexError = 'Session initialization failed: {"code": 500, "details": "Database connection timeout"}';
      expect(sessionError(complexError)).toEqual({
        type: 'session/sessionError',
        payload: complexError
      });
    });
  });

  describe('State Shape Validation', () => {
    it('should always maintain the correct state shape', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert - Test various operations
      let result = sessionReducer(initialState, setSessionId('test-session'));
      expect(result).toMatchObject({
        sessionId: expect.any(String),
        message: { error: expect.any(String) }
      });

      result = sessionReducer(result, sessionError('Test error'));
      expect(result).toMatchObject({
        sessionId: expect.any(String),
        message: { error: expect.any(String) }
      });
    });

    it('should not add unexpected properties to state', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act
      const result = sessionReducer(initialState, setSessionId('test-session'));

      // Assert
      const stateKeys = Object.keys(result);
      expect(stateKeys).toEqual(['sessionId', 'message']);
      expect(Object.keys(result.message)).toEqual(['error']);
    });

    it('should preserve type consistency', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert
      let result = sessionReducer(initialState, setSessionId('string-session-id'));
      expect(typeof result.sessionId).toBe('string');
      expect(typeof result.message.error).toBe('string');

      result = sessionReducer(result, sessionError('string-error-message'));
      expect(typeof result.sessionId).toBe('string');
      expect(typeof result.message.error).toBe('string');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle state updates efficiently', () => {
      // Arrange
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };
      const startTime = performance.now();

      // Act
      for (let i = 0; i < 100; i++) {
        sessionReducer(initialState, setSessionId(`session-${i}`));
      }
      const endTime = performance.now();

      // Assert - Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with frequent updates', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act - Simulate many state updates
      for (let i = 0; i < 50; i++) {
        state = sessionReducer(state, setSessionId(`session-${i}`));
        state = sessionReducer(state, sessionError(`Error ${i}`));
      }

      // Assert - Final state should be valid
      expect(state.sessionId).toBe('session-49');
      expect(state.message.error).toBe('Error 49');
    });

    it('should handle large session IDs efficiently', () => {
      // Arrange
      const largeSessionId = 'session_' + 'x'.repeat(10000);
      const initialState: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act
      const result = sessionReducer(initialState, setSessionId(largeSessionId));

      // Assert
      expect(result.sessionId).toBe(largeSessionId);
      expect(result.sessionId.length).toBe(10008); // 'session_' + 10000 'x' characters
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle session initialization workflow', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert - Simulate real session initialization
      
      // 1. Initially no session
      expect(state.sessionId).toBe('');
      expect(state.message.error).toBe('');

      // 2. Set initial session ID
      state = sessionReducer(state, setSessionId('init-session-abc123'));
      expect(state.sessionId).toBe('init-session-abc123');
      expect(state.message.error).toBe('');

      // 3. Session validation successful (no error)
      expect(state.sessionId).toBe('init-session-abc123');
      expect(state.message.error).toBe('');
    });

    it('should handle session error and retry workflow', () => {
      // Arrange
      let state: SessionState = {
        sessionId: '',
        message: { error: '' }
      };

      // Act & Assert - Simulate session error and retry
      
      // 1. Initial session attempt
      state = sessionReducer(state, setSessionId('first-attempt-session'));
      expect(state.sessionId).toBe('first-attempt-session');

      // 2. Session validation fails
      state = sessionReducer(state, sessionError('Session validation failed'));
      expect(state.message.error).toBe('Session validation failed');
      expect(state.sessionId).toBe('first-attempt-session');

      // 3. Retry with new session
      state = sessionReducer(state, setSessionId('retry-session-def456'));
      expect(state.sessionId).toBe('retry-session-def456');
      expect(state.message.error).toBe('Session validation failed'); // Error persists

      // 4. Clear error on successful retry
      state = sessionReducer(state, sessionError(''));
      expect(state.message.error).toBe('');
      expect(state.sessionId).toBe('retry-session-def456');
    });

    it('should handle session expiration and renewal workflow', () => {
      // Arrange
      let state: SessionState = {
        sessionId: 'active-session-ghi789',
        message: { error: '' }
      };

      // Act & Assert - Simulate session expiration and renewal
      
      // 1. Session expires
      state = sessionReducer(state, sessionError('Session expired'));
      expect(state.message.error).toBe('Session expired');
      expect(state.sessionId).toBe('active-session-ghi789');

      // 2. Renew session
      state = sessionReducer(state, setSessionId('renewed-session-jkl012'));
      expect(state.sessionId).toBe('renewed-session-jkl012');
      expect(state.message.error).toBe('Session expired'); // Error still present

      // 3. Clear expiration error
      state = sessionReducer(state, sessionError(''));
      expect(state.message.error).toBe('');
      expect(state.sessionId).toBe('renewed-session-jkl012');
    });
  });
});