import React from 'react'
import { getIssueReportURL } from './utils/url.js'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.errorInfo) {
      const errorStack = `${
        this.state.error && this.state.error.toString()
      }\r\n${this.state.errorInfo.componentStack}`

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '5rem',
            flexFlow: 'column',
            alignItems: 'center',
          }}
        >
          <h1>
            There was an error processing the build, please leave a bug report
            by clicking:{' '}
            <a
              style={{ textDecoration: 'underline' }}
              target="_blank"
              rel="noopener"
              href={getIssueReportURL(null, errorStack)}
            >
              Here
            </a>
          </h1>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
