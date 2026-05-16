# Bulgarian Learning Lesson JSON Format Guide

This guide describes the JSON format for creating lessons in the Bulgarian Learning app.

## Basic Structure

Every lesson JSON file must have the following root structure:

```json
{
  "title": "Lesson Title",
  "description": "Optional: A brief description of the lesson",
  "content": []
}
```

### Root Level Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | string | ✓ | The main title of the lesson that appears at the top |
| `description` | string | ✗ | Optional description displayed below the title |
| `content` | array | ✓ | Array of content items (tables, sections, notes, quizzes, and more) |

---

## Content Types

The `content` array can contain several item types. Sections can also contain the same content types recursively.

### 1. Table Type

Displays data in a structured table format.

```json
{
  "type": "table",
  "headers": ["Column 1", "Column 2"],
  "rows": [
    ["value1", "value2"],
    ["value3", "value4"]
  ]
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | Must be `"table"` |
| `headers` | array of strings | Column headers |
| `rows` | array of arrays | 2D array where each sub-array is a row |

**Example:**
```json
{
  "type": "table",
  "headers": ["Bulgarian", "English"],
  "rows": [
    ["мама", "mother"],
    ["татко", "father"]
  ]
}
```

---

### 2. Section Type

Organizes content into categorized sections with their own titles and descriptions.

```json
{
  "type": "section",
  "title": "Section Title",
  "description": "Optional section description",
  "content": []
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"section"` |
| `title` | string | ✓ | Section heading |
| `description` | string | ✗ | Optional section description |
| `content` | array | ✓ | Array of nested items (tables, notes, lists, examples, and more) |

**Example:**
```json
{
  "type": "section",
  "title": "Family Members",
  "description": "Learn words for immediate family",
  "content": [
    {
      "type": "table",
      "headers": ["Bulgarian", "English"],
      "rows": [
        ["мама", "mother"],
        ["баща", "father"]
      ]
    }
  ]
}
```

---

### 3. Item Type (Default)

Displays individual items with a main value and secondary information.

```json
{
  "letter": "А",
  "sound": "A"
}
```

OR

```json
{
  "bg": "мама",
  "en": "mother"
}
```

**Properties (choose one pair):**

| Property Pair | Type | Description |
|---------------|------|-------------|
| `letter` + `sound` | strings | For alphabet/letters and phonetic symbols |
| `bg` + `en` | strings | For Bulgarian-English vocabulary pairs |

---

### 4. Note Type

Use notes for short teaching callouts, tips, or warnings.

```json
{
  "type": "note",
  "title": "Pronunciation tip",
  "text": "Ъ is unique to Bulgarian and does not sound like a typical English vowel.",
  "tone": "tip"
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"note"` |
| `title` | string | ✗ | Optional note heading |
| `text` | string | ✓ | Note body text |
| `tone` | string | ✗ | Optional accent: `info`, `tip`, `warning`, or `success` |

---

### 5. List Type

Use lists for quick bullet points, rules, or study prompts.

```json
{
  "type": "list",
  "title": "Remember",
  "items": [
    "Bulgarian nouns usually have grammatical gender.",
    "Many dictionary verbs are shown in the first person singular."
  ]
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"list"` |
| `title` | string | ✗ | Optional list heading |
| `items` | array of strings | ✓ | Bullet points to display |

---

### 6. Example Type

Use examples for paired Bulgarian and English sentences.

```json
{
  "type": "example",
  "bg": "Аз чета книга.",
  "en": "I am reading a book.",
  "note": "A natural present-tense sentence."
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"example"` |
| `bg` | string | ✓ | Bulgarian sentence |
| `en` | string | ✓ | English translation |
| `note` | string | ✗ | Optional usage note |

---

### 7. Cards Type

Use cards for compact study pairs, mini drills, or vocabulary clusters.

```json
{
  "type": "cards",
  "title": "Tricky letters",
  "cards": [
    { "front": "Щ", "back": "sht", "hint": "Common in Bulgarian spelling" },
    { "front": "Ъ", "back": "unique vowel", "hint": "No direct English equivalent" }
  ]
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"cards"` |
| `title` | string | ✗ | Optional block heading |
| `cards` | array | ✓ | Array of front/back pairs |

Each card object supports:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `front` | string | ✓ | Prompt side |
| `back` | string | ✓ | Answer side |
| `hint` | string | ✗ | Optional extra clue |

---

### 8. Quiz Type

Use quick self-check prompts at the end of a section.

```json
{
  "type": "quiz",
  "question": "Which letter sounds like 'sh'?",
  "answer": "Ш",
  "choices": ["Ж", "Ш", "Ч"],
  "note": "Try to answer before revealing the answer."
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"quiz"` |
| `question` | string | ✓ | Prompt for the learner |
| `answer` | string | ✓ | Correct answer |
| `choices` | array of strings | ✗ | Optional multiple-choice options |
| `note` | string | ✗ | Optional coaching note |

---

### 9. Rule Type

Use rule blocks for grammar summaries or study checklists.

```json
{
  "type": "rule",
  "title": "Present tense checklist",
  "bullets": [
    "Pick the correct stem for the verb.",
    "Match the ending to the pronoun.",
    "Read the full phrase aloud."
  ]
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✓ | Must be `"rule"` |
| `title` | string | ✗ | Optional heading |
| `bullets` | array of strings | ✓ | Rule points or checklist items |
| `note` | string | ✗ | Optional reminder text |

---

## Complete Examples

### Example 1: Simple Vocabulary Lesson

```json
{
  "title": "Greetings",
  "description": "Common Bulgarian greetings and polite expressions",
  "content": [
    {
      "type": "table",
      "headers": ["Bulgarian", "English"],
      "rows": [
        ["Здравей", "Hello"],
        ["Благодаря", "Thank you"],
        ["Моля", "Please"]
      ]
    }
  ]
}
```

### Example 2: Lesson with Multiple Sections

```json
{
  "title": "Animals",
  "description": "Learn animal names in Bulgarian",
  "content": [
    {
      "type": "section",
      "title": "Domestic Animals",
      "description": "Animals found on farms",
      "content": [
        {
          "type": "table",
          "headers": ["Bulgarian", "English"],
          "rows": [
            ["куче", "dog"],
            ["котка", "cat"],
            ["кон", "horse"]
          ]
        }
      ]
    },
    {
      "type": "section",
      "title": "Wild Animals",
      "description": "Animals found in nature",
      "content": [
        {
          "type": "table",
          "headers": ["Bulgarian", "English"],
          "rows": [
            ["мечка", "bear"],
            ["вълк", "wolf"],
            ["лиса", "fox"]
          ]
        }
      ]
    }
  ]
}
```

### Example 3: Mixed Content Types

```json
{
  "title": "Alphabet & Numbers",
  "description": "Learn letters and basic counting",
  "content": [
    {
      "type": "section",
      "title": "Cyrillic Letters",
      "content": [
        {
          "type": "table",
          "headers": ["Letter", "Sound"],
          "rows": [
            ["А", "A"],
            ["Б", "B"]
          ]
        }
      ]
    },
    {
      "type": "section",
      "title": "Numbers 1-5",
      "content": [
        {
          "type": "table",
          "headers": ["Bulgarian", "English"],
          "rows": [
            ["един", "one"],
            ["два", "two"]
          ]
        }
      ]
    }
  ]
}
```

### Example 4: Rich Grammar Section

```json
{
  "title": "Present Tense Basics",
  "description": "A lesson that mixes rules, examples, and self-checks.",
  "content": [
    {
      "type": "section",
      "title": "Quick Rule",
      "content": [
        {
          "type": "rule",
          "title": "How to build the form",
          "bullets": [
            "Start with the correct stem.",
            "Add the ending that matches the subject.",
            "Listen for stress changes in speech."
          ]
        },
        {
          "type": "quiz",
          "question": "Which ending often matches 'ние'?",
          "answer": "-ем / -им"
        }
      ]
    }
  ]
}
```

---

## File Naming Convention

Save lesson files as: `lesson{NUMBER:02d}_{name}.json`

Examples:
- `lesson00_alphabet.json`
- `lesson01_family.json`
- `lesson02_verbs.json`
- `lesson03_present-tense.json`
- `lesson04_present-verbs.json`

---

## Best Practices

1. **Keep sections focused**: Each section should cover a related topic
2. **Use descriptive titles**: Make it clear what content is in each section
3. **Maintain consistent formatting**: Use proper Bulgarian characters
4. **Add descriptions**: Help users understand the purpose of sections
5. **Balance table size**: Keep tables to 5-15 rows for better readability
6. **Use meaningful headers**: Be clear about what each column represents
7. **Mix block types intentionally**: Pair tables with notes, examples, or quizzes for better flow
8. **Use tone sparingly**: Reserve `warning` for edge cases and `tip` for memorable details

---

## Tips for Content Creation

- **Tables are best for**: Organized vocabulary, comparisons, structured data
- **Sections are best for**: Grouping related vocabulary, creating logical flow
- **Items are best for**: Simple pairs when you don't need full table structure
- **Notes are best for**: Pronunciation reminders, grammar caveats, and quick context
- **Cards are best for**: Rapid review and short study sets
- **Quizzes are best for**: End-of-section self-checks

---

## Validation Checklist

Before submitting a lesson:

- [ ] Valid JSON format (no trailing commas, proper quotes)
- [ ] `title` field is present and descriptive
- [ ] All tables have matching row/header counts
- [ ] Bulgarian text is properly encoded
- [ ] Section descriptions explain the content
- [ ] File naming follows the convention
- [ ] No empty sections
- [ ] At least one content item per section