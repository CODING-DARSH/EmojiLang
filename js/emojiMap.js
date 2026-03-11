/**
 * emojiMap.js
 * Core language definition for EmojiLang.
 * Maps every emoji to its Python equivalent + metadata.
 */

window.EMOJI_LANG = {

  // ── GROUPS ──────────────────────────────────────────────────────────
  groups: [
    { id: 'io',         label: '📤 Input / Output' },
    { id: 'vars',       label: '📦 Variables' },
    { id: 'math',       label: '🔢 Math Operators' },
    { id: 'compare',    label: '⚖️  Comparison' },
    { id: 'logic',      label: '🧠 Logic' },
    { id: 'control',    label: '🔀 Control Flow' },
    { id: 'loops',      label: '🔁 Loops' },
    { id: 'functions',  label: '🔧 Functions' },
    { id: 'lists',      label: '📋 Lists' },
    { id: 'strings',    label: '💬 Strings' },
    { id: 'types',      label: '🧪 Type Conversion' },
    { id: 'misc',       label: '✨ Misc' },
    { id: 'oop', label: '🏗️ Classes / OOP' },
  ],

  // ── TOKEN MAP ────────────────────────────────────────────────────────
  // Each token: { emoji, python, desc, example, group }
  tokens: [

    // ── IO ──
    { emoji: '📢', python: 'print',        desc: 'Print to console',      example: '📢 "Hello"',             group: 'io' },
    { emoji: '🎤', python: 'input',        desc: 'Read user input',       example: '🎤 "Enter name:"',        group: 'io' },

    // ── VARIABLES ──
    { emoji: '📦', python: '=',            desc: 'Assign variable',       example: 'x 📦 10',                group: 'vars' },
    { emoji: '🔚', python: '',             desc: 'End of statement (newline)', example: '📢 "Hi" 🔚',         group: 'vars' },

    // ── MATH ──
    { emoji: '➕', python: '+',            desc: 'Addition',              example: 'x ➕ y',                 group: 'math' },
    { emoji: '➖', python: '-',            desc: 'Subtraction',           example: 'x ➖ y',                 group: 'math' },
    { emoji: '✖️', python: '*',            desc: 'Multiplication',        example: 'x ✖️ y',                 group: 'math' },
    { emoji: '➗', python: '/',            desc: 'Division',              example: 'x ➗ y',                 group: 'math' },
    { emoji: '🔢', python: '//',           desc: 'Integer division',      example: 'x 🔢 y',                 group: 'math' },
    { emoji: '💯', python: '%',            desc: 'Modulo',                example: 'x 💯 y',                 group: 'math' },
    { emoji: '🌟', python: '**',           desc: 'Power / Exponent',      example: 'x 🌟 2',                 group: 'math' },

    // ── COMPARISON ──
    { emoji: '⚖️', python: '==',           desc: 'Equal to',              example: 'x ⚖️ y',                 group: 'compare' },
    { emoji: '🚫', python: '!=',           desc: 'Not equal to',          example: 'x 🚫 y',                 group: 'compare' },
    { emoji: '📈', python: '>',            desc: 'Greater than',          example: 'x 📈 y',                 group: 'compare' },
    { emoji: '📉', python: '<',            desc: 'Less than',             example: 'x 📉 y',                 group: 'compare' },
    { emoji: '🔝', python: '>=',           desc: 'Greater than or equal', example: 'x 🔝 y',                 group: 'compare' },
    { emoji: '🔛', python: '<=',           desc: 'Less than or equal',    example: 'x 🔛 y',                 group: 'compare' },

    // ── LOGIC ──
    { emoji: '🤝', python: 'and',          desc: 'Logical AND',           example: 'x 🤝 y',                 group: 'logic' },
    { emoji: '🤷', python: 'or',           desc: 'Logical OR',            example: 'x 🤷 y',                 group: 'logic' },
    { emoji: '🙅', python: 'not',          desc: 'Logical NOT',           example: '🙅 x',                   group: 'logic' },
    { emoji: '📖', python: 'in',     desc: 'Membership check', example: '"a" 📖 "apple"', group: 'logic' },
    { emoji: '📕', python: 'not in', desc: 'Not membership',   example: '"z" 📕 "apple"', group: 'logic' },

    // ── CONTROL FLOW ──
    { emoji: '🤔', python: 'if',           desc: 'If condition',          example: '🤔 x 📈 0 📌',           group: 'control' },
    { emoji: '😐', python: 'elif',         desc: 'Else if',               example: '😐 x ⚖️ 0 📌',           group: 'control' },
    { emoji: '🤷‍♂️', python: 'else',         desc: 'Else',                  example: '🤷‍♂️ 📌',                  group: 'control' },
    { emoji: '📌', python: ':',            desc: 'Block start (colon)',   example: '🤔 True 📌',              group: 'control' },
    { emoji: '🔙', python: 'return',       desc: 'Return value',          example: '🔙 x ➕ y',              group: 'control' },
    { emoji: '💥', python: 'break',        desc: 'Break out of loop',     example: '💥',                     group: 'control' },
    { emoji: '⏭️', python: 'continue',     desc: 'Continue to next iter', example: '⏭️',                     group: 'control' },
    { emoji: '🚪', python: 'pass',         desc: 'Pass (no-op)',          example: '🚪',                     group: 'control' },

    // ── LOOPS ──
    { emoji: '🔁', python: 'for',          desc: 'For loop',              example: '🔁 i 🌀 🧮(10) 📌',     group: 'loops' },
    { emoji: '🌀', python: 'in',           desc: 'In (loop iterator)',    example: '🔁 x 🌀 myList 📌',      group: 'loops' },
    { emoji: '🔄', python: 'while',        desc: 'While loop',            example: '🔄 x 📈 0 📌',           group: 'loops' },

    // ── FUNCTIONS ──
    { emoji: '🔧', python: 'def',          desc: 'Define function',       example: '🔧 add(a, b) 📌',        group: 'functions' },
    { emoji: '📞', python: '',             desc: 'Call a function',       example: '📞 add(2, 3)',            group: 'functions' },
    { emoji: '🎁', python: 'lambda',       desc: 'Lambda function',       example: '🎁 x 📌 x ✖️ 2',        group: 'functions' },

    // ── LISTS ──
    { emoji: '📋', python: '[]',           desc: 'Empty list literal',    example: 'myList 📦 📋',           group: 'lists' },
    { emoji: '➕📋', python: '.append',    desc: 'Append to list',        example: 'myList➕📋(val)',         group: 'lists' },
    { emoji: '🗑️📋', python: '.remove',   desc: 'Remove from list',      example: 'myList🗑️📋(val)',        group: 'lists' },
    { emoji: '📏', python: 'len',          desc: 'Length of list/string', example: '📏(myList)',             group: 'lists' },
    { emoji: '🧮', python: 'range',        desc: 'Range of numbers',      example: '🧮(1, 10)',              group: 'lists' },
    { emoji: '🗂️', python: '{}',     desc: 'Empty dictionary', example: 'd 📦 🗂️',        group: 'lists' },
    { emoji: '🔑', python: '.keys',  desc: 'Dict keys',        example: 'd🔑()',           group: 'lists' },
    { emoji: '💎', python: '.values',desc: 'Dict values',      example: 'd💎()',           group: 'lists' },
    // ── STRINGS ──
    { emoji: '🔗', python: '+',            desc: 'String concat',         example: '"Hello" 🔗 " World"',    group: 'strings' },
    { emoji: '✂️', python: '.split',       desc: 'Split string',          example: 'txt✂️(" ")',             group: 'strings' },
    { emoji: '🔤', python: '.upper',       desc: 'Uppercase string',      example: 'txt🔤()',                group: 'strings' },
    { emoji: '🔡', python: '.lower',       desc: 'Lowercase string',      example: 'txt🔡()',                group: 'strings' },
    { emoji: '🔍', python: '.find',    desc: 'Find in string',    example: 'txt🔍("hi")',      group: 'strings' },
    { emoji: '🔀', python: '.replace', desc: 'Replace in string', example: 'txt🔀("a","b")',   group: 'strings' },
    // ── TYPE CONVERSION ──
    { emoji: '🔢➡️', python: 'int',        desc: 'Convert to integer',    example: '🔢➡️("42")',             group: 'types' },
    { emoji: '💧',   python: 'float',      desc: 'Convert to float',      example: '💧("3.14")',             group: 'types' },
    { emoji: '💬',   python: 'str',        desc: 'Convert to string',     example: '💬(42)',                 group: 'types' },
    { emoji: '✅',   python: 'True',       desc: 'Boolean True',          example: 'x 📦 ✅',                group: 'types' },
    { emoji: '❌',   python: 'False',      desc: 'Boolean False',         example: 'x 📦 ❌',                group: 'types' },
    { emoji: '🕳️',  python: 'None',       desc: 'None / Null',           example: 'x 📦 🕳️',               group: 'types' },

    // ── MISC ──
    { emoji: '#️⃣',  python: '#',          desc: 'Comment',               example: '#️⃣ This is a comment',  group: 'misc' },
    { emoji: '📥',   python: 'import',     desc: 'Import module',         example: '📥 math',                group: 'misc' },
    { emoji: '⬆️',   python: '+=',         desc: 'Increment',             example: 'x ⬆️ 1',                group: 'misc' },
    { emoji: '⬇️',   python: '-=',         desc: 'Decrement',             example: 'x ⬇️ 1',                group: 'misc' },
        // More list operations
    { emoji: '🔃', python: '.sort',    desc: 'Sort list',        example: 'nums🔃()',          group: 'lists' },
    { emoji: '↩️', python: '.reverse', desc: 'Reverse list', example: 'nums↩️()', group: 'lists' },
    { emoji: '🧹', python: '.clear',   desc: 'Clear list',       example: 'nums🧹()',          group: 'lists' },
    { emoji: '🗺️', python: '.index', desc: 'Find index', example: 'nums🗺️(5)', group: 'lists' },
    { emoji: '🗃️', python: 'sorted', desc: 'Return sorted copy', example: '🗃️(nums)', group: 'lists' },
    { emoji: '🔺', python: 'max', desc: 'Maximum value', example: '🔺(nums)', group: 'lists' },
    { emoji: '🔻', python: 'min', desc: 'Minimum value', example: '🔻(nums)', group: 'lists' },
    { emoji: '➕🔢', python: 'sum', desc: 'Sum of list', example: '➕🔢(nums)', group: 'lists' },
    { emoji: '🎲', python: 'abs',      desc: 'Absolute value',   example: '🎲(-5)',            group: 'math' },
    { emoji: '🔵', python: 'round',    desc: 'Round number',     example: '🔵(3.7)',           group: 'math' },

    // String extras
    { emoji: '🧩', python: '.join',    desc: 'Join list',        example: '" "🧩(words)',      group: 'strings' },
    { emoji: '🧼', python: '.strip', desc: 'Strip whitespace', example: 'txt🧼()', group: 'strings' },
    { emoji: '🔎', python: '.count',   desc: 'Count occurrences',example: 'txt🔎("a")',        group: 'strings' },
    { emoji: '🔰', python: '.startswith', desc: 'Starts with', example: 'txt🔰("he")', group: 'strings' },
    { emoji: '🏮', python: '.endswith',   desc: 'Ends with',   example: 'txt🏮("lo")', group: 'strings' },

    { emoji: '🛡️', python: 'try',     desc: 'Try block',     example: '🛡️ 📌',   group: 'control' },
    { emoji: '🚑', python: 'except',  desc: 'Except block',  example: '🚑 📌',    group: 'control' },
    { emoji: '🏁', python: 'finally', desc: 'Finally block', example: '🏁 📌',    group: 'control' },
    { emoji: '💣', python: 'raise',   desc: 'Raise error',   example: '💣 ValueError("msg")', group: 'control' },

    { emoji: '🏗️', python: 'class',   desc: 'Define class',  example: '🏗️ Dog 📌',          group: 'oop' },
    { emoji: '🧬', python: 'self',    desc: 'Self reference', example: '🧬.name',             group: 'oop' },
    { emoji: '⚙️', python: '__init__',desc: 'Constructor',    example: '🔧 ⚙️(🧬) 📌',       group: 'oop' },
    { emoji: '🧲', python: 'super',   desc: 'Super class',    example: '🧲()',                group: 'oop' },
    ],

  // ── EXAMPLES ────────────────────────────────────────────────────────
  examples: {
    helloWorld: `#️⃣ Hello World example
📢 "Hello, World! 🌍"`,

    variables: `#️⃣ Variables and arithmetic
name 📦 "Alice"
age  📦 20
score 📦 95.5

📢 "Name:" 🔗 name
📢 "Age:"
📢 age
📢 "Score:"
📢 score`,

    ifElse: `#️⃣ If / Else example
x 📦 42

🤔 x 📈 100 📌
    📢 "x is big!"
😐 x 📈 50 📌
    📢 "x is medium"
🤷‍♂️ 📌
    📢 "x is small"`,

    loop: `#️⃣ For loop with range
🔁 i 🌀 🧮(5) 📌
    📢 "Iteration:" 🔗 💬(i)

#️⃣ While loop
count 📦 0
🔄 count 📉 3 📌
    📢 count
    count ⬆️ 1`,

    function: `#️⃣ Define and call a function
🔧 greet(name) 📌
    message 📦 "Hello, " 🔗 name 🔗 "!"
    🔙 message

result 📦 greet("World")
📢 result

🔧 add(a, b) 📌
    🔙 a ➕ b

📢 add(10, 32)`,

    fizzbuzz: `#️⃣ FizzBuzz!
🔁 i 🌀 🧮(1, 21) 📌
    🤔 i 💯 15 ⚖️ 0 📌
        📢 "FizzBuzz"
    😐 i 💯 3 ⚖️ 0 📌
        📢 "Fizz"
    😐 i 💯 5 ⚖️ 0 📌
        📢 "Buzz"
    🤷‍♂️ 📌
        📢 i`,
  }
};