const express = require('express');
const app = express();

// Success Page Handler
app.get('/success', async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      const { city, region } = session.metadata;
      
      if (!CITY_APIS[city]) {
        return res.status(400).send('Invalid city data');
      }
  
      const apiConfig = CITY_APIS[city];
      const response = await fetch(`${apiConfig.endpoint}?${new URLSearchParams(apiConfig.params(region))}`);
      const data = await response.json();
  
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Schedule - ParkingRules Pro</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50">
            <header class="bg-white shadow-sm">
                <nav class="max-w-6xl mx-auto px-4 py-4">
                    <a href="/" class="text-xl font-bold text-gray-900">← Back to ParkingRules Pro</a>
                </nav>
            </header>
  
            <main class="max-w-6xl mx-auto px-4 py-12">
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">
                            ${apiConfig.name} Street Cleaning Schedule
                        </h1>
                        ${region ? `<p class="text-lg text-gray-600">Region: ${region.charAt(0).toUpperCase() + region.slice(1)}</p>` : ''}
                    </div>
  
                    <div class="grid gap-6 md:grid-cols-2">
                        ${data.map(entry => `
                            <div class="bg-gray-50 p-6 rounded-lg">
                                <h3 class="font-medium text-gray-900 mb-2">${entry.street || 'Area'} Schedule</h3>
                                <dl class="space-y-2">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Next Cleaning</dt>
                                        <dd class="text-gray-900">${new Date(entry.next_cleaning).toLocaleDateString()}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Frequency</dt>
                                        <dd class="text-gray-900">${entry.frequency}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-600">Hours</dt>
                                        <dd class="text-gray-900">${entry.hours}</dd>
                                    </div>
                                </dl>
                            </div>
                        `).join('')}
                    </div>
  
                    <div class="mt-8 text-center">
                        <a href="/" class="text-blue-600 hover:underline">← Search another location</a>
                    </div>
                </div>
            </main>
        </body>
        </html>
      `);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
