const fs = require('fs');

const code = fs.readFileSync('./components/GameCanvas.tsx', 'utf8');

// Simple bracket matching
let stack = [];
let lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line: i + 1, col: j });
        } else if (char === '}' || char === ')' || char === ']') {
            const last = stack.pop();
            const expected = char === '}' ? '{' : char === ')' ? '(' : '[';
            if (!last || last.char !== expected) {
                console.log(`Mismatch at line ${i + 1}, col ${j}: found ${char}, expected matching for ${last ? last.char : 'none'}`);
            }
        }
    }
}

if (stack.length > 0) {
    console.log('Unclosed brackets:');
    stack.forEach(s => console.log(`Line ${s.line}, col ${s.col}: ${s.char}`));
} else {
    console.log('Brackets are balanced.');
}
