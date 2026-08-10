import { Component, type ReactNode } from "react";
import OfoqLogo from "./OfoqLogo";

interface Props { children: ReactNode; fallbackPath?: string; }
interface State { hasError: boolean; error: Error | null; }

/**
 * Global error boundary — catches uncaught render exceptions and shows a
 * friendly recovery screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[OFOQ] Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const goBack = () => {
      this.setState({ hasError: false, error: null });
      window.location.href = this.props.fallbackPath ?? "/";
    };

    return (
      <div
        className="min-h-screen bg-[#2B273F] flex items-center justify-center px-6"
        dir="rtl"
      >
        <div className="text-center max-w-md">
          <div className="mb-8 flex justify-center">
            <OfoqLogo className="w-20 h-14" />
          </div>
          <p className="text-[#E5FE04] text-xs font-bold uppercase tracking-[.25em] mb-4">
            حدث خطأ غير متوقع
          </p>
          <h1 className="text-white text-3xl font-black mb-4">
            الصفحة لا تستجيب
          </h1>
          <p className="text-white/40 text-sm mb-8">
            يرجى المحاولة مرة أخرى. إذا استمرت المشكلة تواصل مع الدعم.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left bg-black/30 text-white/50 text-xs p-4 rounded-xl mb-6 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 bg-[#33B27C] text-white font-black px-8 py-4 rounded-full hover:bg-[#2a9668] transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }
}
