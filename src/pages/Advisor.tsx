import { Bot, Send, ShieldAlert, User as UserIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavBar } from "../components/NavBar";
import { PageHeader, Spinner } from "../components/shared/ui";
import { useAuth } from "../hooks/useAuth";
import { usePortfolio } from "../hooks/usePortfolio";
import {
  MAX_INPUT,
  needsProfile,
  parseAmount,
  parseIntent,
  QUESTIONS,
  QUICK_ACTIONS,
  reply,
  type Block,
  type Intent,
} from "../utils/advisorBot";
import { PROFILE_LABELS, profileFromAnswers, type Profile } from "../utils/portfolioAnalysis";
import { loadProfile, saveProfile } from "../utils/userStorage";

interface Message {
  id: number;
  from: "bot" | "user";
  blocks: Block[];
  question?: number;
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "text") return <p>{block.text}</p>;
  if (block.kind === "list") {
    return (
      <ul className="list-disc pl-5 flex flex-col gap-1">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[var(--text-muted)] border-b border-[var(--border)]">
            {block.head.map((h, i) => (
              <th key={h} className={`px-3 py-2 font-medium ${i ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b border-[var(--border)] last:border-b-0">
              {row.map((cell, i) => (
                <td key={i} className={`px-3 py-2 tabular-nums ${i ? "text-right" : "text-left"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Advisor() {
  const { user } = useAuth();
  const { positions, loading, quotesLoaded } = usePortfolio();
  const [profile, setProfile] = useState<Profile | null>(() => (user ? loadProfile(user.id) : null));
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [pending, setPending] = useState<Intent | null>(null);
  const [awaitingAmount, setAwaitingAmount] = useState(false);
  const [input, setInput] = useState("");
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const push = useCallback((from: Message["from"], blocks: Block[], q?: number) => {
    setMessages((m) => [...m, { id: nextId.current++, from, blocks, question: q }]);
  }, []);

  const askQuestion = useCallback(
    (index: number) => {
      setQuestion(index);
      push("bot", [{ kind: "text", text: `${index + 1}/${QUESTIONS.length} · ${QUESTIONS[index].text}` }], index);
    },
    [push],
  );

  const startQuestionnaire = useCallback(() => {
    setAnswers([]);
    push("bot", [{ kind: "text", text: "Vou te fazer 3 perguntas rápidas para entender seu perfil de investidor." }]);
    askQuestion(0);
  }, [askQuestion, push]);

  const answer = useCallback(
    (intent: Intent, currentProfile: Profile | null) => {
      if (intent.type === "perfil") {
        startQuestionnaire();
        return;
      }
      if (needsProfile(intent) && !currentProfile) {
        setPending(intent);
        push("bot", [{ kind: "text", text: "Para isso, preciso conhecer seu perfil primeiro." }]);
        startQuestionnaire();
        return;
      }
      setAwaitingAmount(intent.type === "aporte" && intent.amount === null);
      push("bot", reply(intent, { positions, profile: currentProfile }));
    },
    [positions, push, startQuestionnaire],
  );

  useEffect(() => {
    if (loading || !quotesLoaded || started.current) return;
    started.current = true;
    const greeting: Block[] = [
      { kind: "text", text: `Olá${user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Sou o assistente de sugestões do InvestDash.` },
    ];
    if (profile) {
      push("bot", [...greeting, { kind: "text", text: `Seu perfil registrado é ${PROFILE_LABELS[profile].toLowerCase()}. Escolha um tema abaixo ou escreva sua pergunta.` }]);
      push("bot", reply({ type: "resumo" }, { positions, profile }));
    } else {
      push("bot", greeting);
      startQuestionnaire();
    }
  }, [loading, quotesLoaded, positions, profile, push, startQuestionnaire, user]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const chooseOption = (value: number, label: string) => {
    if (question === null) return;
    push("user", [{ kind: "text", text: label }]);
    const next = [...answers, value];
    setAnswers(next);
    if (question + 1 < QUESTIONS.length) {
      askQuestion(question + 1);
      return;
    }
    setQuestion(null);
    const p = profileFromAnswers(next);
    setProfile(p);
    if (user) saveProfile(user.id, p);
    push("bot", [{ kind: "text", text: `Seu perfil é ${PROFILE_LABELS[p].toLowerCase()}. Vou usar essa referência nas sugestões.` }]);
    if (pending) {
      const intent = pending;
      setPending(null);
      answer(intent, p);
    } else {
      push("bot", reply({ type: "ajuda" }, { positions, profile: p }));
    }
  };

  const send = (raw: string) => {
    const text = raw.trim().slice(0, MAX_INPUT);
    if (!text) return;
    setInput("");
    push("user", [{ kind: "text", text }]);
    if (question !== null) {
      push("bot", [{ kind: "text", text: "Escolha uma das opções acima para continuar o questionário." }]);
      return;
    }
    let intent = parseIntent(text);
    const amount = parseAmount(text);
    if (awaitingAmount && amount !== null && intent.type === "desconhecido") {
      intent = { type: "aporte", amount };
    }
    answer(intent, profile);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-4">
        <PageHeader
          title="Sugestões"
          subtitle={profile ? `Assistente de carteira · perfil ${PROFILE_LABELS[profile].toLowerCase()}` : "Assistente de carteira"}
        />

        <div className="flex items-start gap-2 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 px-3 py-2.5">
          <ShieldAlert size={15} className="shrink-0 mt-0.5" aria-hidden />
          <p>
            Conteúdo educativo, gerado por regras automáticas a partir dos dados da sua carteira. Não é recomendação de
            investimento. Para decisões, consulte um profissional certificado.
          </p>
        </div>

        {loading || !quotesLoaded ? (
          <Spinner />
        ) : (
          <section className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl flex flex-col h-[70vh] min-h-[420px]">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" aria-live="polite">
              {messages.map((m) => {
                const isBot = m.from === "bot";
                const active = m.question !== undefined && m.question === question;
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isBot ? "bg-emerald-500/15 text-emerald-400" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"}`}
                      aria-hidden
                    >
                      {isBot ? <Bot size={15} /> : <UserIcon size={15} />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm flex flex-col gap-2 ${isBot ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]" : "bg-emerald-500/15 text-[var(--text-primary)]"}`}
                    >
                      {m.blocks.map((b, i) => (
                        <BlockView key={i} block={b} />
                      ))}
                      {m.question !== undefined && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {QUESTIONS[m.question].options.map((label, i) => (
                            <button
                              key={label}
                              disabled={!active}
                              onClick={() => chooseOption(i + 1, label)}
                              className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] p-3 flex flex-col gap-2.5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => send(a.text)}
                    disabled={question !== null}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition disabled:opacity-40"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={MAX_INPUT}
                  placeholder={question !== null ? "Responda usando as opções acima" : "Pergunte algo, ex.: onde aportar 2.000?"}
                  disabled={question !== null}
                  autoComplete="off"
                  aria-label="Mensagem para o assistente"
                  className="flex-1 min-w-0 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || question !== null}
                  className="px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black disabled:opacity-40 transition"
                  aria-label="Enviar"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
