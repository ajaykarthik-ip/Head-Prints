import { NextRequest, NextResponse } from 'next/server';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  location: string;
}

// Hardcoded inventory data that syncs with your frontend
const inventory: InventoryItem[] = [
  { id: 1, name: 'Laptop Dell XPS', category: 'Electronics', quantity: 45, unit: 'pcs', price: 1200, supplier: 'Dell Inc', location: 'A-01-01' },
  { id: 2, name: 'Office Chair', category: 'Furniture', quantity: 23, unit: 'pcs', price: 150, supplier: 'ErgoMax', location: 'B-02-03' },
  { id: 3, name: 'A4 Paper', category: 'Stationery', quantity: 500, unit: 'pack', price: 5, supplier: 'PaperCorp', location: 'C-01-05' },
  { id: 4, name: 'Printer Ink', category: 'Electronics', quantity: 8, unit: 'pcs', price: 45, supplier: 'HP Store', location: 'A-03-02' },
  { id: 5, name: 'Desk Lamp', category: 'Furniture', quantity: 15, unit: 'pcs', price: 35, supplier: 'LightCorp', location: 'B-01-04' },
  { id: 6, name: 'USB Cable', category: 'Electronics', quantity: 120, unit: 'pcs', price: 12, supplier: 'TechStore', location: 'A-02-01' },
  { id: 7, name: 'Notebook', category: 'Stationery', quantity: 85, unit: 'pcs', price: 8, supplier: 'PaperCorp', location: 'C-02-01' }
];

// AI Detection - determines what type of request this is
function detectQueryType(message: string): 'query' | 'dataEntry' | 'summarization' | 'general' {
  const lower = message.toLowerCase();
  
  // Data entry: "add X items", mentions price/units
  if (lower.includes('add ') && (lower.includes('units') || lower.includes('$') || lower.includes('price') || lower.includes('each'))) {
    return 'dataEntry';
  }
  
  // Summarization: mentions changes, stock decreased/increased
  if (lower.includes('stock decreased') || lower.includes('stock increased') || 
      lower.includes('new item added') || lower.includes('summarize') ||
      lower.includes('inventory update') || lower.includes('changes:')) {
    return 'summarization';
  }
  
  // Query: asking for information
  if (lower.includes('show me') || lower.includes('how many') || lower.includes('list') ||
      lower.includes('find') || lower.includes('low stock') || lower.includes('what items')) {
    return 'query';
  }
  
  return 'general';
}

// 🔍 FEATURE 1: Natural Language Query Processing
async function handleInventoryQuery(message: string): Promise<string> {
  const lower = message.toLowerCase();
  
  // Low stock items
  if (lower.includes('low stock') || lower.includes('running low')) {
    const lowStockItems = inventory.filter(item => item.quantity < 20);
    if (lowStockItems.length === 0) {
      return "✅ Great news! No items are currently low in stock (below 20 units).";
    }
    return `⚠️ Found **${lowStockItems.length} low stock items:**\n\n${lowStockItems.map(item => 
      `• **${item.name}**: ${item.quantity} ${item.unit} remaining (Location: ${item.location})`
    ).join('\n')}`;
  }
  
  // Laptop queries
  if (lower.includes('laptop') || lower.includes('dell')) {
    const laptops = inventory.filter(item => 
      item.name.toLowerCase().includes('laptop') || item.name.toLowerCase().includes('dell')
    );
    if (laptops.length === 0) {
      return "No laptops found in inventory.";
    }
    return `💻 Found **${laptops.length} laptop(s):**\n\n${laptops.map(item => 
      `• **${item.name}**: ${item.quantity} units available at $${item.price} each\n  📍 Location: ${item.location}`
    ).join('\n')}`;
  }
  
  // Supplier queries
  if (lower.includes('papercorp') || lower.includes('paper corp')) {
    const paperCorpItems = inventory.filter(item => 
      item.supplier.toLowerCase().includes('papercorp')
    );
    return `📋 **PaperCorp supplies ${paperCorpItems.length} items:**\n\n${paperCorpItems.map(item => 
      `• **${item.name}**: ${item.quantity} ${item.unit} in stock ($${item.price} each)`
    ).join('\n')}`;
  }
  
  // Electronics category
  if (lower.includes('electronics')) {
    const electronics = inventory.filter(item => item.category === 'Electronics');
    return `⚡ **Electronics Category (${electronics.length} items):**\n\n${electronics.map(item => 
      `• **${item.name}**: ${item.quantity} ${item.unit} - $${item.price}`
    ).join('\n')}`;
  }
  
  // Total/summary queries
  if (lower.includes('total') || lower.includes('summary') || lower.includes('overview')) {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const categories = [...new Set(inventory.map(item => item.category))];
    const lowStock = inventory.filter(item => item.quantity < 20).length;
    
    return `📊 **Inventory Summary:**\n\n• **Total unique items:** ${inventory.length}\n• **Total units:** ${totalItems}\n• **Categories:** ${categories.join(', ')}\n• **Low stock alerts:** ${lowStock} items\n• **Total value:** $${inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}`;
  }
  
  // Price queries
  if (lower.includes('expensive') || lower.includes('most expensive') || lower.includes('highest price')) {
    const mostExpensive = inventory.reduce((max, item) => item.price > max.price ? item : max);
    return `💰 **Most expensive item:**\n\n• **${mostExpensive.name}**: $${mostExpensive.price} each\n• **Category:** ${mostExpensive.category}\n• **Stock:** ${mostExpensive.quantity} ${mostExpensive.unit}`;
  }
  
  // Default help response
  return `🤖 I can help you with inventory queries like:\n\n• "Show me low stock items"\n• "How many laptops do we have?"\n• "What items are from PaperCorp?"\n• "Give me an inventory summary"\n• "What electronics do we have?"\n\nWhat would you like to know?`;
}

// 📝 FEATURE 2: Smart Data Entry (Extract structured data from natural language)
async function processDataEntry(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback parsing for basic cases
    const match = message.match(/add\s+(\d+)\s+(.+?)\s+at\s+\$(\d+)/i);
    if (match) {
      return `✅ **Extracted Data:**\n\n• **Item:** ${match[2]}\n• **Quantity:** ${match[1]} units\n• **Price:** $${match[3]}\n• **Category:** General\n• **Supplier:** Unknown\n\n_Note: AI parsing unavailable. Using basic extraction._`;
    }
    return "❌ Could not parse the data entry. Please use format: 'Add 20 HP Printers at $300 each from HP Store'";
  }

  try {
    const extractionPrompt = `Extract inventory item data from this text and return ONLY a JSON object with these exact keys: item_name, category, quantity, unit, price, supplier, location.

Rules:
- Return only valid JSON, no extra text
- Use reasonable defaults: unit="pcs", category="General", location="TBD", supplier="Unknown"
- Quantity and price must be numbers
- If information is missing, use defaults

Input: "${message}"

JSON:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: extractionPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        })
      }
    );

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!aiResponse) throw new Error('No AI response');

    // Parse JSON response
    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (e) {
      const jsonMatch = aiResponse.match(/\{.*\}/s);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response');
      }
    }

    // Format the response
    return `✅ **Successfully extracted item data:**\n\n• **Name:** ${extractedData.item_name}\n• **Category:** ${extractedData.category}\n• **Quantity:** ${extractedData.quantity} ${extractedData.unit}\n• **Price:** $${extractedData.price}\n• **Supplier:** ${extractedData.supplier}\n• **Location:** ${extractedData.location}\n\n_Ready to add to inventory! (Note: This is a demo - actual adding would require backend integration)_`;

  } catch (error) {
    return `❌ **Data extraction failed.**\n\nPlease try a format like:\n"Add 25 HP Printers at $250 each from HP Store, Electronics category"\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// 📊 FEATURE 3: Inventory Change Summarization
async function generateSummary(changesText: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Basic fallback summarization
    const lines = changesText.split('\n').filter(line => line.trim());
    let summary = "📋 **Inventory Changes Summary:**\n\n";
    
    lines.forEach(line => {
      if (line.includes('decreased')) {
        summary += `• ⬇️ ${line.trim()}\n`;
      } else if (line.includes('increased')) {
        summary += `• ⬆️ ${line.trim()}\n`;
      } else if (line.includes('added')) {
        summary += `• ✅ ${line.trim()}\n`;
      } else {
        summary += `• 📝 ${line.trim()}\n`;
      }
    });
    
    return summary + "\n_Note: Basic summarization used (AI unavailable)_";
  }

  try {
    const summaryPrompt = `You are an inventory analyst. Summarize these inventory changes in a clear, business-friendly format.

Use bullet points and highlight critical issues like low stock. Be concise but informative.

Changes:
${changesText}

Summary:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: summaryPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    );

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    return summary || "Could not generate summary. Please try again.";

  } catch (error) {
    return `❌ Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Main API endpoint
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const queryType = detectQueryType(message);
    let responseMessage: string;

    switch (queryType) {
      case 'query':
        responseMessage = await handleInventoryQuery(message);
        break;
        
      case 'dataEntry':
        responseMessage = await processDataEntry(message);
        break;
        
      case 'summarization':
        responseMessage = await generateSummary(message);
        break;
        
      default:
        // General conversation
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          responseMessage = "👋 I'm your inventory assistant! Try asking:\n\n• 'Show me low stock items'\n• 'Add 20 printers at $300 each'\n• 'What laptops do we have?'\n\nHow can I help you today?";
          break;
        }

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a helpful inventory management assistant. The user said: "${message}". Respond helpfully and conversationally.` }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
              })
            }
          );

          const data = await response.json();
          responseMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
            "I'm here to help with your inventory management needs!";
        } catch {
          responseMessage = "I'm here to help with inventory management! Ask me about stock levels, adding items, or inventory summaries.";
        }
    }

    return NextResponse.json({
      message: responseMessage,
      queryType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again.'
    }, { status: 500 });
  }
}