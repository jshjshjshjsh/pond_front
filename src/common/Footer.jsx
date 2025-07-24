import React from 'react';

// 스타일을 컴포넌트 내에 직접 포함
const footerStyle = {
    marginTop: '100px',
    padding: '40px 0',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #eee',
    textAlign: 'center',
    color: '#778899' // --point-color
};

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
};

const Footer = () => {
    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <p>Copyright&copy; 2025 All Rights reserved by jshjshjshjsh</p>
            </div>
        </footer>
    );
};

export default Footer;