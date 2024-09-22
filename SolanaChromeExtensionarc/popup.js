document.getElementById('getInfo').addEventListener('click', async () => {
  const contractAddress = document.getElementById('contractAddress').value;

  if (!contractAddress) {
    document.getElementById('output').textContent = "Please enter a contract address.";
    return;
  }

  try {
    // Fetch token info from your backend
    const response = await fetch('https://rug-check-backend-cd671e950746.herokuapp.com/api/getFullTokenDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contractAddress, tokenMint: contractAddress })
    });
    
    const data = await response.json();

    if (response.ok) {
      document.getElementById('output').innerHTML = '';

      const tokenIconUrl = data.chart_data.pairs[0].info.imageUrl || '';
      if (tokenIconUrl) {
        const logo = document.createElement('img');
        logo.src = tokenIconUrl;
        logo.alt = `${data.name} icon`;
        logo.style.width = '120px';
        logo.style.display = 'block';
        logo.style.margin = '0 auto';
        document.getElementById('output').appendChild(logo);
      }

      // Display token information
      const createInfoBox = (label, value) => `
        <div class="info-box">
          <div class="info-label">${label}:</div>
          <div class="info-value">${value}</div>
        </div>
      `;
      document.getElementById('output').innerHTML += createInfoBox('Name', data.name);
      document.getElementById('output').innerHTML += createInfoBox('Symbol', data.symbol);
      document.getElementById('output').innerHTML += createInfoBox('Description', data.description || 'No description available');
      document.getElementById('output').innerHTML += createInfoBox('Price per Token', data.price_per_token || 'Price info not available');
      document.getElementById('output').innerHTML += createInfoBox('Total Supply', data.total_supply);
      document.getElementById('output').innerHTML += createInfoBox('Burn Percentage', data.burn_percentage || 'No burn info');

      // Now fetch Dex Screener price data for the token
      const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
      const dexScreenerData = await dexScreenerResponse.json();

      console.log('Dex Screener Data:', dexScreenerData);

      if (dexScreenerData && dexScreenerData.pairs.length > 0) {
        const txnsData = dexScreenerData.pairs[0].txns;

        const buyCounts = [];
        const sellCounts = [];
        const timeIntervals = [];

        // Use buy/sell transaction counts for charting
        if (txnsData.h24) {
          buyCounts.push(txnsData.h24.buys);
          sellCounts.push(txnsData.h24.sells);
          timeIntervals.push('24 hours ago');
        }

        if (txnsData.h6) {
          buyCounts.push(txnsData.h6.buys);
          sellCounts.push(txnsData.h6.sells);
          timeIntervals.push('6 hours ago');
        }

        if (txnsData.h1) {
          buyCounts.push(txnsData.h1.buys);
          sellCounts.push(txnsData.h1.sells);
          timeIntervals.push('1 hour ago');
        }

        // Log the counts to ensure they are populated correctly
        console.log('Buy Counts:', buyCounts);
        console.log('Sell Counts:', sellCounts);
        console.log('Time Intervals:', timeIntervals);

        // Dynamically adjust chart width
        const canvas = document.getElementById('dexChartCanvas');
        const chartContainer = document.getElementById('chart-container');
        
        canvas.width = chartContainer.clientWidth; // Dynamically set canvas width based on container
        canvas.height = 300; // Keep height fixed

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
          type: 'bar', // Bar chart for buys and sells
          data: {
            labels: timeIntervals, // X-axis labels (time intervals)
            datasets: [
              {
                label: 'Buys',
                data: buyCounts, // Buy transaction counts
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
              },
              {
                label: 'Sells',
                data: sellCounts, // Sell transaction counts
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        console.error('No transaction data found');
      }

    } else {
      document.getElementById('output').textContent = 'Error fetching token info.';
    }
  } catch (error) {
    document.getElementById('output').textContent = 'Error: ' + error.message;
    console.error('Error fetching Dex Screener data:', error);
  }
});
