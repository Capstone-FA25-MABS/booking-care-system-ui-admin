import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Ignore removeChild errors in development (common with React Strict Mode + Bootstrap/Simplebar)
        // These errors don't affect functionality and are caused by DOM library conflicts
        if (
            error.name === 'NotFoundError' &&
            error.message.includes('removeChild') &&
            process.env.NODE_ENV === 'development'
        ) {
            // Silently ignore - no warning needed as it's handled by suppressReactErrors.ts
            // Return no error state to prevent error UI from showing
            return {
                hasError: false,
                error: null,
                errorInfo: null,
            };
        }

        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Ignore removeChild errors in development (common with React Strict Mode + Bootstrap/Simplebar)
        if (
            error.name === 'NotFoundError' &&
            error.message.includes('removeChild') &&
            process.env.NODE_ENV === 'development'
        ) {
            // Silently ignore - no warning needed as it's handled by suppressReactErrors.ts
            // Reset error state to allow component to continue rendering
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
            });
            return;
        }

        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '20px',
                        textAlign: 'center',
                    }}
                >
                    <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h1>
                    {this.state.error && (
                        <div style={{ marginBottom: '20px', color: '#666' }}>
                            <p>
                                <strong>Error:</strong> {this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <details style={{ marginTop: '10px', textAlign: 'left' }}>
                                    <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                                        Stack trace
                                    </summary>
                                    <pre
                                        style={{
                                            background: '#f5f5f5',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            overflow: 'auto',
                                            maxHeight: '300px',
                                        }}
                                    >
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
