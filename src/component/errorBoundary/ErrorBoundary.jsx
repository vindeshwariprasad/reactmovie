import React from "react";
import logger from "../../utils/logger";

import "./style.scss";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logger.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="errorBoundary">
                    <span className="errorTitle">Something went wrong.</span>
                    <span className="errorMessage">
                        {this.state.error?.message || "An unexpected error occurred."}
                    </span>
                    <button className="retryBtn" onClick={this.handleRetry}>
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
