export default function LivePreview({ code }) {
  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={`
        <html>
          <body></body>
          <script type="module">
            try {
              ${code}
            } catch(e) {
              document.body.innerHTML = '<pre>' + e + '</pre>';
            }
          </script>
        </html>
      `}
    ></iframe>
  );
}
