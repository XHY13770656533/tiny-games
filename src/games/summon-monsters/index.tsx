import type { CSSProperties, FormEvent, ClipboardEvent, MouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import GameLayout from '../../components/GameLayout/GameLayout';
import {
  attributeLabels,
  calculateBattleForecast,
  getMonsterById,
  getMonsterBySpell,
  levels,
  monsters,
  resolveBattle,
  type BattleResult,
  type Monster,
} from './logic';
import styles from './styles.module.css';

type GamePhase = 'summoning' | 'battle' | 'levelWon' | 'levelLost' | 'gameWon';
type LastAttempt = 'success' | 'failed' | 'duplicate' | null;

const maxLogLength = 8;

export default function SummonMonstersGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('summoning');
  const [remainingSeconds, setRemainingSeconds] = useState(levels[0].summonSeconds);
  const [spellInput, setSpellInput] = useState('');
  const [summonedMonsterIds, setSummonedMonsterIds] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<LastAttempt>(null);
  const [log, setLog] = useState<string[]>([
    `第 1 关「${levels[0].name}」开始。打开魔法书，照着输入完整咒语。`,
  ]);
  const timersRef = useRef<number[]>([]);

  const level = levels[levelIndex];
  const isFinalLevel = levelIndex === levels.length - 1;
  const summonedMonsters = useMemo(
    () => summonedMonsterIds.map((id) => getMonsterById(id)).filter((monster): monster is Monster => Boolean(monster)),
    [summonedMonsterIds],
  );
  const summonedIdSet = useMemo(() => new Set(summonedMonsterIds), [summonedMonsterIds]);
  const battleForecast = useMemo(
    () => calculateBattleForecast(summonedMonsters, level.hero),
    [level.hero, summonedMonsters],
  );
  const canSummon = phase === 'summoning' && remainingSeconds > 0;
  const timerProgress = Math.round((remainingSeconds / level.summonSeconds) * 100);
  const stageStyle = {
    '--timer-progress': `${timerProgress}%`,
    '--victory-chance': `${battleForecast.victoryChance}%`,
  } as CSSProperties;

  useEffect(() => () => clearBattleTimers(), []);

  useEffect(() => {
    if (phase !== 'summoning') {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      startBattle();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, remainingSeconds]);

  function clearBattleTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function appendLog(entries: string[]) {
    setLog((currentLog) => [...entries, ...currentLog].slice(0, maxLogLength));
  }

  function handleSummon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSummon || spellInput.length === 0) {
      return;
    }

    const monster = getMonsterBySpell(spellInput);

    if (!monster) {
      appendLog([`咒语「${spellInput}」冒出一团尴尬黑烟，召唤失败，需要重新输入。`]);
      setSpellInput('');
      setLastAttempt('failed');
      return;
    }

    if (summonedIdSet.has(monster.id)) {
      appendLog([`「${monster.name}」本关已经响应过召唤，同一种怪物不能重复登场。`]);
      setSpellInput('');
      setLastAttempt('duplicate');
      return;
    }

    setSummonedMonsterIds((currentIds) => [...currentIds, monster.id]);
    setSpellInput('');
    setLastAttempt('success');
    appendLog([`召唤成功：${monster.name}加入战场，${attributeLabels[monster.attribute]}气息正在扩散。`]);
  }

  function startBattle() {
    if (phase !== 'summoning') {
      return;
    }

    clearBattleTimers();
    setSpellInput('');
    setIsBookOpen(false);
    setLastAttempt(null);

    const result = resolveBattle(summonedMonsters, level.hero);
    setBattleResult(result);
    setPhase('battle');
    appendLog([`召唤时间结束，${summonedMonsters.length} 只怪物迎战${level.hero.title}${level.hero.name}。`]);

    timersRef.current = [
      window.setTimeout(() => {
        setPhase(result.victory ? (isFinalLevel ? 'gameWon' : 'levelWon') : 'levelLost');
      }, 3200),
    ];
  }

  function resetLevel(message = `重新挑战第 ${level.id} 关「${level.name}」。`) {
    clearBattleTimers();
    setPhase('summoning');
    setRemainingSeconds(level.summonSeconds);
    setSpellInput('');
    setSummonedMonsterIds([]);
    setBattleResult(null);
    setLastAttempt(null);
    setIsBookOpen(false);
    setLog([message]);
  }

  function goToNextLevel() {
    if (isFinalLevel) {
      return;
    }

    clearBattleTimers();
    const nextLevel = levels[levelIndex + 1];
    setLevelIndex((currentIndex) => currentIndex + 1);
    setPhase('summoning');
    setRemainingSeconds(nextLevel.summonSeconds);
    setSpellInput('');
    setSummonedMonsterIds([]);
    setBattleResult(null);
    setLastAttempt(null);
    setIsBookOpen(false);
    setLog([`第 ${nextLevel.id} 关「${nextLevel.name}」开始：${nextLevel.briefing}`]);
  }

  function resetGame() {
    clearBattleTimers();
    setLevelIndex(0);
    setPhase('summoning');
    setRemainingSeconds(levels[0].summonSeconds);
    setSpellInput('');
    setSummonedMonsterIds([]);
    setBattleResult(null);
    setIsBookOpen(false);
    setLastAttempt(null);
    setLog([`重新开始：第 1 关「${levels[0].name}」正在逼近。`]);
  }

  function blockBookCopy(event: ClipboardEvent<HTMLElement>) {
    event.preventDefault();
  }

  function blockBookMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
  }

  return (
    <GameLayout
      title="召唤怪物"
      description="扮演邪恶魔法师，在倒计时内输入中文咒语召唤怪物。咒语必须完全正确，标点也不能错；每关同一种怪物只能召唤一次，时间结束后怪物军团会自动与勇者战斗。"
      actions={
        <>
          <button className="button" type="button" onClick={() => setIsBookOpen(true)}>
            打开魔法书
          </button>
          <button className="button" type="button" onClick={resetGame}>
            重新开始
          </button>
        </>
      }
      aside={
        <div className={styles.asideContent}>
          <section>
            <h2>关卡情报</h2>
            <ol className={styles.levelList}>
              {levels.map((item) => (
                <li className={item.id === level.id ? styles.currentLevel : undefined} key={item.id}>
                  <strong>
                    第 {item.id} 关：{item.name}
                  </strong>
                  <span>
                    {item.hero.title}{item.hero.name} · {item.summonSeconds} 秒
                  </span>
                  <small>{item.briefing}</small>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2>召唤规则</h2>
            <ul className={styles.ruleList}>
              <li>输入完整咒语并提交，文字、逗号、句号、感叹号都要一致。</li>
              <li>咒语错误会召唤失败并清空输入，需要重新输入。</li>
              <li>每关同一种怪物只能召唤一次，下一关会重置召唤名单。</li>
              <li>魔法书可查看咒语，但内容禁选、禁复制；请手动抄写。</li>
            </ul>
          </section>
        </div>
      }
    >
      <div className={styles.wrapper} style={stageStyle}>
        <section className={styles.statusPanel} aria-label="召唤状态">
          <StatusCard label="当前关卡" value={`${level.id} / ${levels.length}`} detail={level.name} />
          <StatusCard label="剩余时间" value={formatSeconds(remainingSeconds)} detail="时间归零自动开战" />
          <StatusCard label="已召唤" value={`${summonedMonsters.length} / ${monsters.length}`} detail="本关不可重复" />
          <StatusCard label="当前胜率" value={`${battleForecast.victoryChance}%`} detail="随召唤阵容变化" />
        </section>

        <section className={`${styles.stage} ${styles[`phase-${phase}`]}`} aria-label="召唤与战斗舞台">
          <div className={styles.timerBar} aria-hidden="true">
            <span />
          </div>

          <div className={styles.sceneHeader}>
            <div>
              <p className={styles.eyebrow}>Level {level.id}</p>
              <h2>{getPhaseTitle(phase)}</h2>
              <p>{getPhaseText(phase, level, summonedMonsters.length, battleResult)}</p>
            </div>
            <button className={styles.bookButton} type="button" onClick={() => setIsBookOpen(true)}>
              查看魔法书
            </button>
          </div>

          <div className={styles.battlefield}>
            <div className={styles.magicCircle} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <div className={styles.monsterSide} aria-label="已召唤怪物">
              {summonedMonsters.length > 0 ? (
                summonedMonsters.map((monster) => (
                  <div className={styles.monsterToken} key={monster.id} title={monster.name}>
                    <span>{monster.emoji}</span>
                    <small>{monster.name}</small>
                  </div>
                ))
              ) : (
                <div className={styles.emptySummons}>召唤阵还空着</div>
              )}
            </div>

            <article className={styles.heroCard} aria-label="进攻勇者">
              <span className={styles.heroEmoji}>{level.hero.emoji}</span>
              <p>{level.hero.title}</p>
              <h3>{level.hero.name}</h3>
              <dl>
                <div>
                  <dt>生命</dt>
                  <dd>{level.hero.hp}</dd>
                </div>
                <div>
                  <dt>攻击</dt>
                  <dd>{level.hero.attack}</dd>
                </div>
                <div>
                  <dt>防御</dt>
                  <dd>{level.hero.defense}</dd>
                </div>
                <div>
                  <dt>速度</dt>
                  <dd>{level.hero.speed}</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        <section className={styles.controlPanel} aria-label="输入召唤咒语">
          <div className={styles.controlHeader}>
            <div>
              <p className={styles.eyebrow}>Incantation</p>
              <h2>输入召唤咒语</h2>
            </div>
            <span className={getAttemptClassName(lastAttempt)}>{getAttemptText(lastAttempt)}</span>
          </div>

          <form className={styles.spellForm} onSubmit={handleSummon}>
            <input
              aria-label="召唤咒语输入框"
              autoComplete="off"
              disabled={!canSummon}
              placeholder="例如：骨头敲三下，勇者腿打架！"
              spellCheck={false}
              type="text"
              value={spellInput}
              onChange={(event) => setSpellInput(event.target.value)}
              onPaste={(event) => event.preventDefault()}
            />
            <button disabled={!canSummon || spellInput.length === 0} type="submit">
              召唤
            </button>
          </form>
          <p className={styles.inputHint}>提示：输入框也禁止粘贴，请从魔法书中手动抄写咒语。</p>
        </section>

        <section className={styles.forecastGrid} aria-label="战斗预估">
          <div className={styles.forecastCard}>
            <div className={styles.chanceMeter} aria-hidden="true">
              <span />
            </div>
            <h2>战斗胜率 {battleForecast.victoryChance}%</h2>
            <p>
              怪物战力 {battleForecast.monsterScore} 对抗勇者威胁 {battleForecast.heroScore}。
              {battleForecast.advantageTags.length > 0
                ? ` 当前克制：${battleForecast.advantageTags.join('、')}。`
                : ' 暂无明显属性克制。'}
            </p>
          </div>

          <div className={styles.heroIntel}>
            <h2>勇者弱点</h2>
            <div className={styles.tagRow}>
              {level.hero.weaknesses.map((attribute) => (
                <span className={styles.goodTag} key={attribute}>
                  怕{attributeLabels[attribute]}
                </span>
              ))}
              {level.hero.resistances.map((attribute) => (
                <span className={styles.badTag} key={attribute}>
                  抗{attributeLabels[attribute]}
                </span>
              ))}
            </div>
            <p>{level.hero.description}</p>
          </div>
        </section>

        <section className={styles.logPanel} aria-label="召唤与战斗日志">
          <div className={styles.logHeading}>
            <h2>邪恶日志</h2>
            <span>还可召唤 {monsters.length - summonedMonsters.length} 种怪物</span>
          </div>
          <ol>
            {log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ol>
        </section>

        {battleResult ? (
          <section className={styles.resultPanel} aria-live="polite">
            <div>
              <p className={styles.eyebrow}>Battle</p>
              <h2>{battleResult.victory ? '怪物军团占了上风' : '勇者突破了防线'}</h2>
            </div>
            <ol>
              {battleResult.lines.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ol>
            {phase === 'levelWon' ? (
              <button className={styles.primaryAction} type="button" onClick={goToNextLevel}>
                进入下一关
              </button>
            ) : null}
            {phase === 'levelLost' ? (
              <button className={styles.primaryAction} type="button" onClick={() => resetLevel()}>
                重试本关
              </button>
            ) : null}
            {phase === 'gameWon' ? (
              <button className={styles.primaryAction} type="button" onClick={resetGame}>
                再当一次邪恶魔法师
              </button>
            ) : null}
          </section>
        ) : null}
      </div>

      {isBookOpen ? (
        <MagicBookModal
          summonedIdSet={summonedIdSet}
          onClose={() => setIsBookOpen(false)}
          onCopy={blockBookCopy}
          onContextMenu={blockBookMenu}
        />
      ) : null}
    </GameLayout>
  );
}

type StatusCardProps = {
  label: string;
  value: string;
  detail: string;
};

function StatusCard({ label, value, detail }: StatusCardProps) {
  return (
    <div className={styles.statusCard}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

type MagicBookModalProps = {
  summonedIdSet: Set<string>;
  onClose: () => void;
  onCopy: (event: ClipboardEvent<HTMLElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
};

function MagicBookModal({ summonedIdSet, onClose, onCopy, onContextMenu }: MagicBookModalProps) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <section
        aria-label="魔法书"
        aria-modal="true"
        className={styles.magicBook}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onContextMenu={onContextMenu}
        onCopy={onCopy}
        onCut={onCopy}
      >
        <div className={styles.bookHeader}>
          <div>
            <p className={styles.eyebrow}>Grimoire</p>
            <h2>怪物召唤魔法书</h2>
            <p>内容已施加防复制结界：不能选中、不能复制、不能右键。</p>
          </div>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className={styles.bookGrid}>
          {monsters.map((monster) => (
            <article className={summonedIdSet.has(monster.id) ? styles.usedBookCard : styles.bookCard} key={monster.id}>
              <div className={styles.bookMonsterHeader}>
                <span>{monster.emoji}</span>
                <div>
                  <h3>{monster.name}</h3>
                  <p>{monster.title}</p>
                </div>
              </div>
              <dl className={styles.monsterStats}>
                <div>
                  <dt>属性</dt>
                  <dd>{attributeLabels[monster.attribute]}</dd>
                </div>
                <div>
                  <dt>攻</dt>
                  <dd>{monster.attack}</dd>
                </div>
                <div>
                  <dt>防</dt>
                  <dd>{monster.defense}</dd>
                </div>
                <div>
                  <dt>速</dt>
                  <dd>{monster.speed}</dd>
                </div>
              </dl>
              <p className={styles.spellText}>{monster.spell}</p>
              <small>{summonedIdSet.has(monster.id) ? '本关已召唤' : monster.description}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatSeconds(seconds: number) {
  return `${seconds.toString().padStart(2, '0')} 秒`;
}

function getAttemptClassName(attempt: LastAttempt) {
  if (attempt === 'success') {
    return styles.attemptSuccess;
  }

  if (attempt === 'failed' || attempt === 'duplicate') {
    return styles.attemptFailed;
  }

  return styles.attemptIdle;
}

function getAttemptText(attempt: LastAttempt) {
  if (attempt === 'success') {
    return '召唤成功';
  }

  if (attempt === 'failed') {
    return '咒语错误';
  }

  if (attempt === 'duplicate') {
    return '本关已召唤';
  }

  return '等待咒语';
}

function getPhaseTitle(phase: GamePhase) {
  if (phase === 'battle') {
    return '怪物正在围攻勇者';
  }

  if (phase === 'levelWon') {
    return '本关通过';
  }

  if (phase === 'levelLost') {
    return '防线被突破';
  }

  if (phase === 'gameWon') {
    return '邪恶魔法师守住了高塔';
  }

  return '召唤时间';
}

function getPhaseText(
  phase: GamePhase,
  level: typeof levels[number],
  summonedCount: number,
  battleResult: BattleResult | null,
) {
  if (phase === 'battle') {
    return '过场动画进行中，怪物会自动战斗，不需要玩家干预。';
  }

  if (phase === 'levelWon') {
    return `勇者暂时撤退。你可以带着邪恶笑声进入下一关。`;
  }

  if (phase === 'levelLost') {
    return battleResult
      ? `这次胜率 ${battleResult.victoryChance}%，命运骰掷出 ${battleResult.roll}。重新组织怪物阵容吧。`
      : '勇者冲破了怪物军团。';
  }

  if (phase === 'gameWon') {
    return '五名勇者都被击退，今天的高塔依旧邪恶。';
  }

  return `${level.briefing} 当前已召唤 ${summonedCount} 只怪物。`;
}
