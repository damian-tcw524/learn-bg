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
| `content` | array | ✓ | Array of content items (tables, sections, or individual items) |

---

## Content Types

The `content` array can contain three types of items:

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
| `content` | array | ✓ | Array of items (tables, individual items) |

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

**Example:**
```json
{
  "bg": "добро утро",
  "en": "good morning"
}
```

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
            ["конь", "horse"]
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

---

## File Naming Convention

Save lesson files as: `lesson{NUMBER:02d}_{name}.json`

Examples:
- `lesson00_alphabet.json`
- `lesson01_family.json`
- `lesson02_verbs.json`
- `lesson03_colors.json`

---

## Best Practices

1. **Keep sections focused**: Each section should cover a related topic
2. **Use descriptive titles**: Make it clear what content is in each section
3. **Maintain consistent formatting**: Use proper Bulgarian characters
4. **Add descriptions**: Help users understand the purpose of sections
5. **Balance table size**: Keep tables to 5-15 rows for better readability
6. **Use meaningful headers**: Be clear about what each column represents

---

## Tips for Content Creation

- **Tables are best for**: Organized vocabulary, comparisons, structured data
- **Sections are best for**: Grouping related vocabulary, creating logical flow
- **Items are best for**: Simple pairs when you don't need full table structure

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
