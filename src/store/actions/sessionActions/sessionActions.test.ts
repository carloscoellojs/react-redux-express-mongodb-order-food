import axios from 'axios';
import type { AppDispatch } from '../../../store';
import { setSessionIdAction } from './sessionActions';
import {
  sessionError,
  setSessionId
} from '../../reducers/sessionReducer/sessionReducer';
import type { SessionResponse } from '../../../types/types';

// Mock dependencies
jest.mock('axios');
jest.mock('../../reducers/sessionReducer/sessionReducer');

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock action creators
const mockSessionError = sessionError as jest.MockedFunction<typeof sessionError>;
const mockSetSessionId = setSessionId as jest.MockedFunction<typeof setSessionId>;

// Mock dispatch
const mockDispatch = jest.fn() as jest.MockedFunction<AppDispatch>;

// Mock data
const mockSessionResponse: SessionResponse = {
  session: {
    userId: 'session-user-123'
  }
};

const mockSessionResponse2: SessionResponse = {
  session: {
    userId: 'session-user-456'
  }
};

describe('Session Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios defaults
    mockedAxios.defaults = {
      headers: {
        common: {}
      }
    } as any;
  });

  describe('setSessionIdAction', () => {
    describe('Success Scenarios', () => {
      it('successfully initializes session and sets session ID', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/session/init');
        expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId('session-user-123'));
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-123');
      });

      it('sets axios default header with correct session ID', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-123');
      });

      it('handles different session IDs correctly', async () => {
        // Arrange
        mockedAxios.post.mockResolvedValue({ data: mockSessionResponse2 });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId('session-user-456'));
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-456');
      });

      it('overwrites previous session header when called multiple times', async () => {
        // Arrange
        mockedAxios.post
          .mockResolvedValueOnce({ data: mockSessionResponse })
          .mockResolvedValueOnce({ data: mockSessionResponse2 });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-456');
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenNthCalledWith(1, mockSetSessionId('session-user-123'));
        expect(mockDispatch).toHaveBeenNthCalledWith(2, mockSetSessionId('session-user-456'));
      });

      it('handles session IDs with special characters', async () => {
        // Arrange
        const specialSessionResponse: SessionResponse = {
          session: {
            userId: 'session-123-abc_def.xyz@domain.com'
          }
        };
        mockedAxios.post.mockResolvedValue({ data: specialSessionResponse });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId('session-123-abc_def.xyz@domain.com'));
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-123-abc_def.xyz@domain.com');
      });

      it('handles very long session IDs', async () => {
        // Arrange
        const longSessionId = 'a'.repeat(1000); // Very long session ID
        const longSessionResponse: SessionResponse = {
          session: {
            userId: longSessionId
          }
        };
        mockedAxios.post.mockResolvedValue({ data: longSessionResponse });
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId(longSessionId));
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe(longSessionId);
      });
    });

    describe('Error Scenarios', () => {
      it('handles network errors when initializing session', async () => {
        // Arrange
        const networkError = { message: 'Network Error' };
        mockedAxios.post.mockRejectedValue(networkError);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/session/init');
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError('Network Error'));
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('setSessionId')
        }));
      });

      it('handles API server errors (500)', async () => {
        // Arrange
        const serverError = { 
          message: 'Internal Server Error',
          response: { status: 500 }
        };
        mockedAxios.post.mockRejectedValue(serverError);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError('Internal Server Error'));
      });

      it('handles authentication errors (401)', async () => {
        // Arrange
        const authError = { 
          message: 'Unauthorized',
          response: { status: 401 }
        };
        mockedAxios.post.mockRejectedValue(authError);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError('Unauthorized'));
      });

      it('handles timeout errors', async () => {
        // Arrange
        const timeoutError = { 
          message: 'timeout of 30000ms exceeded',
          code: 'ECONNABORTED' 
        };
        mockedAxios.post.mockRejectedValue(timeoutError);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError('timeout of 30000ms exceeded'));
      });

      it('handles errors without message property', async () => {
        // Arrange
        const errorWithoutMessage = {};
        mockedAxios.post.mockRejectedValue(errorWithoutMessage);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError(undefined));
      });

      it('does not set axios header when session initialization fails', async () => {
        // Arrange
        const error = { message: 'Session init failed' };
        mockedAxios.post.mockRejectedValue(error);
        const originalHeader = mockedAxios.defaults.headers.common['Session-Id'];
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        expect(mockedAxios.defaults.headers.common['Session-Id']).toBe(originalHeader);
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError('Session init failed'));
      });

      it('handles malformed response structure', async () => {
        // Arrange
        const malformedResponse = { data: { wrongStructure: 'invalid' } };
        mockedAxios.post.mockResolvedValue(malformedResponse);
        
        // Act
        await setSessionIdAction()(mockDispatch);
        
        // Assert
        // When the response structure is wrong, accessing response.data.session.userId 
        // will cause a TypeError, which gets caught and dispatches an error action
        expect(mockDispatch).toHaveBeenCalledWith(mockSessionError(expect.any(String)));
        // Verify it was an error call and not a success call
        expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('setSessionId')
        }));
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles concurrent session initialization calls', async () => {
      // Arrange
      mockedAxios.post
        .mockResolvedValueOnce({ data: { session: { userId: 'session-1' } } })
        .mockResolvedValueOnce({ data: { session: { userId: 'session-2' } } })
        .mockResolvedValueOnce({ data: { session: { userId: 'session-3' } } });
      
      // Act
      const promise1 = setSessionIdAction()(mockDispatch);
      const promise2 = setSessionIdAction()(mockDispatch);
      const promise3 = setSessionIdAction()(mockDispatch);
      
      await Promise.all([promise1, promise2, promise3]);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      // Last session ID should be set in header
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-3');
    });

    it('handles empty string session ID', async () => {
      // Arrange
      const emptySessionResponse: SessionResponse = {
        session: {
          userId: ''
        }
      };
      mockedAxios.post.mockResolvedValue({ data: emptySessionResponse });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId(''));
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('');
    });

    it('preserves other axios default headers', async () => {
      // Arrange
      mockedAxios.defaults.headers.common['Content-Type'] = 'application/json';
      mockedAxios.defaults.headers.common['Authorization'] = 'Bearer token';
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockedAxios.defaults.headers.common['Content-Type']).toBe('application/json');
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe('Bearer token');
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-123');
    });

    it('handles null or undefined userId gracefully', async () => {
      // Arrange
      const nullUserIdResponse = { 
        data: { 
          session: { 
            userId: null 
          } 
        } 
      };
      mockedAxios.post.mockResolvedValue(nullUserIdResponse);
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(mockSetSessionId(null));
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe(null);
    });
  });

  describe('Action Creator Verification', () => {
    it('verifies setSessionId action creator is called with correct session ID', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockSetSessionId).toHaveBeenCalledWith('session-user-123');
    });

    it('verifies sessionError action creator is called with correct error message', async () => {
      // Arrange
      const errorMessage = 'Test error message';
      mockedAxios.post.mockRejectedValue({ message: errorMessage });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockSessionError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Performance and Reliability', () => {
    it('completes session initialization within reasonable time', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      const startTime = Date.now();
      
      // Act
      await setSessionIdAction()(mockDispatch);
      const endTime = Date.now();
      
      // Assert - Should complete quickly
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid successive session initialization calls', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      
      // Act - Call multiple times rapidly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(setSessionIdAction()(mockDispatch));
      }
      await Promise.all(promises);
      
      // Assert
      expect(mockedAxios.post).toHaveBeenCalledTimes(10);
      expect(mockDispatch).toHaveBeenCalledTimes(10);
    });

    it('maintains consistent behavior across multiple calls', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      await setSessionIdAction()(mockDispatch);
      await setSessionIdAction()(mockDispatch);
      
      // Assert - Each call should behave identically
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      mockDispatch.mock.calls.forEach(call => {
        expect(call[0]).toEqual(mockSetSessionId('session-user-123'));
      });
    });
  });

  describe('Integration with Axios Headers', () => {
    it('verifies Session-Id header is set correctly', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValue({ data: mockSessionResponse });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-123');
    });

    it('verifies header is updated on subsequent calls', async () => {
      // Arrange
      mockedAxios.post
        .mockResolvedValueOnce({ data: mockSessionResponse })
        .mockResolvedValueOnce({ data: mockSessionResponse2 });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-123');
      
      await setSessionIdAction()(mockDispatch);
      expect(mockedAxios.defaults.headers.common['Session-Id']).toBe('session-user-456');
    });

    it('does not modify headers when session init fails', async () => {
      // Arrange
      const originalHeaders = { ...mockedAxios.defaults.headers.common };
      mockedAxios.post.mockRejectedValue({ message: 'Init failed' });
      
      // Act
      await setSessionIdAction()(mockDispatch);
      
      // Assert
      expect(mockedAxios.defaults.headers.common).toEqual(originalHeaders);
    });
  });
});