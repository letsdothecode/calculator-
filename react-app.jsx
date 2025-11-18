const { useState, useEffect } = React;

function Calculator() {
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const isOperator = c => c === '+' || c === '-' || c === '*' || c === '/';
  const lastChar = s => s[s.length - 1];
  const currentNumberHasDecimal = s => {
    let i = s.length - 1;
    while (i >= 0 && !isOperator(s[i])) { if (s[i] === '.') return true; i--; }
    return false;
  };
  const expForEntry = s => {
    if (s === '') return '0';
    let i = s.length - 1, buf = '';
    while (i >= 0 && !isOperator(s[i])) { buf = s[i] + buf; i--; }
    return buf || lastChar(s);
  };
  const updateExpr = fn => setExpression(prev => fn(prev));

  const appendDigit = d => {
    if (justEvaluated) { setJustEvaluated(false); setExpression('' + d); return; }
    updateExpr(prev => prev + d);
  };
  const appendOperator = op => {
    updateExpr(prev => {
      if (prev.length === 0) {
        if (op === '-') return '-';
        return prev;
      }
      if (justEvaluated) setJustEvaluated(false);
      const l = lastChar(prev);
      if (isOperator(l)) return prev.slice(0, -1) + op;
      return prev + op;
    });
  };
  const appendDecimal = () => {
    if (justEvaluated) { setJustEvaluated(false); setExpression('0.'); return; }
    updateExpr(prev => {
      const l = lastChar(prev || '');
      if (!prev || isOperator(l)) return prev + '0.';
      if (currentNumberHasDecimal(prev)) return prev;
      return prev + '.';
    });
  };
  const del = () => updateExpr(prev => prev.slice(0, -1));
  const clearAll = () => { setExpression(''); setJustEvaluated(false); };

  const tokenize = expr => {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];
      if (c === ' ') { i++; continue; }
      if (isOperator(c)) {
        if (c === '-' && (tokens.length === 0 || isOperator(tokens[tokens.length - 1]))) {
          let j = i + 1;
          let num = '-';
          while (j < expr.length && (!isOperator(expr[j]) || expr[j] === '.')) { if (expr[j] === ' ') break; num += expr[j]; j++; }
          tokens.push(parseFloat(num));
          i = j;
          continue;
        } else {
          tokens.push(c);
          i++;
          continue;
        }
      }
      let num = '';
      while (i < expr.length && (!isOperator(expr[i]) || expr[i] === '.')) { if (expr[i] === ' ') break; num += expr[i]; i++; }
      if (num !== '') tokens.push(parseFloat(num));
    }
    return tokens;
  };
  const compute = () => {
    if (!expression) return;
    let expr = expression;
    while (expr.length && isOperator(expr[expr.length - 1])) expr = expr.slice(0, -1);
    const tokens = tokenize(expr);
    if (tokens.length === 0) return;
    const md = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t === '*' || t === '/') {
        const a = md.pop();
        const b = tokens[i + 1];
        if (typeof a !== 'number' || typeof b !== 'number') { clearAll(); return; }
        if (t === '/' && b === 0) { clearAll(); return; }
        md.push(t === '*' ? a * b : a / b);
        i += 2;
        continue;
      }
      md.push(t);
      i++;
    }
    let res = md[0];
    i = 1;
    while (i < md.length) {
      const op = md[i];
      const b = md[i + 1];
      if (op === '+') res = res + b;
      else if (op === '-') res = res - b;
      i += 2;
    }
    const out = Number.isFinite(res) ? String(res) : 'Error';
    setExpression(out);
    setJustEvaluated(true);
  };

  const handleKey = k => {
    if (k === 'clear') { clearAll(); return; }
    if (k === 'del') { del(); return; }
    if (k === '=') { compute(); return; }
    if (k === '.') { appendDecimal(); return; }
    if (k === '+' || k === '-' || k === '*' || k === '/') { appendOperator(k); return; }
    appendDigit(k);
  };

  useEffect(() => {
    const onKey = e => {
      const k = e.key;
      if ((k >= '0' && k <= '9') || k === '+' || k === '-' || k === '*' || k === '/' || k === '.' || k === '=' || k === 'Enter' || k === 'Backspace' || k.toLowerCase() === 'c') e.preventDefault();
      if (k === 'Enter' || k === '=') handleKey('=');
      else if (k === 'Backspace') handleKey('del');
      else if (k.toLowerCase() === 'c') handleKey('clear');
      else if (k === '.' || k === '+' || k === '-' || k === '*' || k === '/' || (k >= '0' && k <= '9')) handleKey(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expression, justEvaluated]);

  return (
    <div className="app">
      <div className="calc">
        <div className="display">
          <div className="exp">{expression}</div>
          <div className="entry">{expForEntry(expression)}</div>
        </div>
        <div className="keys">
          <button className="key fn" onClick={() => handleKey('clear')}>C</button>
          <button className="key fn" onClick={() => handleKey('del')}>DEL</button>
          <button className="key op" onClick={() => handleKey('/')}>÷</button>
          <button className="key op" onClick={() => handleKey('*')}>×</button>

          <button className="key num" onClick={() => handleKey('7')}>7</button>
          <button className="key num" onClick={() => handleKey('8')}>8</button>
          <button className="key num" onClick={() => handleKey('9')}>9</button>
          <button className="key op" onClick={() => handleKey('-')}>−</button>

          <button className="key num" onClick={() => handleKey('4')}>4</button>
          <button className="key num" onClick={() => handleKey('5')}>5</button>
          <button className="key num" onClick={() => handleKey('6')}>6</button>
          <button className="key op" onClick={() => handleKey('+')}>+</button>

          <button className="key num" onClick={() => handleKey('1')}>1</button>
          <button className="key num" onClick={() => handleKey('2')}>2</button>
          <button className="key num" onClick={() => handleKey('3')}>3</button>
          <button className="key eq" onClick={() => handleKey('=')}>=</button>

          <button className="key num wide" onClick={() => handleKey('0')}>0</button>
          <button className="key num" onClick={() => handleKey('.')}>.</button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Calculator />);
