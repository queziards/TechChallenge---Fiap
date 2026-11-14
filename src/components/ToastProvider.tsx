import Ionicons from '@expo/vector-icons/Ionicons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error';

type ToastMessage = {
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ message, type });
    timeout.current = setTimeout(() => {
      setToast(null);
      timeout.current = null;
    }, 3200);
  }, []);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <SafeAreaView pointerEvents="none" edges={['top']} style={styles.overlay}>
            <View
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={[styles.toast, toast.type === 'success' ? styles.success : styles.error]}
            >
              <Ionicons
                name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.message}>{toast.message}</Text>
            </View>
          </SafeAreaView>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de ToastProvider.');
  return context;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    minHeight: 52,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  success: { backgroundColor: '#166534' },
  error: { backgroundColor: '#B91C1C' },
  message: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
