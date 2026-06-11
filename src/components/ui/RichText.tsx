import type { ReactNode } from "react";

// 行内:**粗体** | *斜体* | http(s) 链接;一次性正则切分,顺序优先粗体再斜体再链接
const TOKEN_RE = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(https?:\/\/[^\s]+)/g;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(<strong key={`${key}-${i}`}>{m[1].slice(2, -2)}</strong>);
    } else if (m[2]) {
      out.push(<em key={`${key}-${i}`}>{m[2].slice(1, -1)}</em>);
    } else if (m[3]) {
      out.push(
        <a
          key={`${key}-${i}`}
          href={m[3]}
          target="_blank"
          rel="noreferrer"
          className="ag-rt-link"
        >
          {m[3]}
        </a>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** 极简、安全的富文本渲染:空行分段、列表、粗体、斜体、链接。不用 dangerouslySetInnerHTML。 */
export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList =
          lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={bi} className="ag-rt-list">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="ag-rt-p">
            {lines.map((l, li) => (
              <span key={li}>
                {inline(l, `${bi}-${li}`)}
                {li < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
