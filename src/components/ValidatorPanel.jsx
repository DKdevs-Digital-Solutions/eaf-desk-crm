export default function ValidatorPanel({ src, title }) {
  return (
    <iframe
      title={title}
      src={src}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
      allow="camera; microphone; notifications; clipboard"
      className="w-full h-full bg-white"
      style={{ minHeight: "320px" }}
    />
  );
}
