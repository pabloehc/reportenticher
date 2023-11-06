import { loadState } from '@nextcloud/initial-state'
import OpenAI, { toFile }from 'openai'

const GPT_API_KEY = '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'
const loader = document.getElementById("loader")
const fileForm = document.getElementById("reportForm")
const dropdown = document.getElementById("reports");
const downloadBtn = document.getElementById("download-insights");
const responseDiv = document.querySelector('#app-content #response')
const reader = new FileReader()

hide(loader)
hide(downloadBtn)

// we wait for the page to be fully loaded
document.addEventListener('DOMContentLoaded', (e) => {
	main()
})

function main() {
	// we get the data injected via the Initial Sftate mechanism
	const state = loadState('reportenricher', 'tutorial_initial_state')
}

fileForm.addEventListener("submit",  (e) => {
    e.preventDefault(); // Prevent the form from submitting and refreshing the page
    show(loader)

    const file = document.getElementById("file").files[0] // Load uploaded file
    if (dropdown.options[dropdown.selectedIndex].value == "image-edit") {
        reader.readAsArrayBuffer(file); // This will trigger the 'load' event
    } else {
        reader.readAsText(file) // Triggers 'load' event when loaded
    }
})

// read file
reader.addEventListener('load', async (e) => {
    let fileContent = e.target.result

    if (dropdown.options[dropdown.selectedIndex].value == "image-edit") {    
        let generatedImage = await generateImage(fileContent);
        const imageElement = document.getElementById("image-element");
        imageElement.src = 'data:image/jpeg;base64,' + generatedImage;
        hide(loader)
        return
    }

    let prompt = await generatePromptFromReport(fileContent, dropdown.options[dropdown.selectedIndex].value)
    let answer = await askGpt(prompt)
    hide(loader)
    responseDiv.innerText = answer
    show(downloadBtn)
})

downloadBtn.addEventListener("click", function() {
    const reportTitle = dropdown.options[dropdown.selectedIndex].value;
    const responseText = responseDiv.innerText;
    downloadReport(reportTitle.replace(/\s+/g, '_') + "-insights"+ ".txt", responseText);
});

function downloadReport(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


async function generatePromptFromReport(reportContent, reportType) {
    let prompt = ""
    if (reportType == "management-plan") {
        console.log("Cons")
        const networkRisks = extractTopRisks("1 - Network Management Plan", "2 - Security Management Plan", reportContent);
        const securityRisks = extractTopRisks("2 - Security Management Plan", "3 - Exchange Management Plan", reportContent);
        const exchangeRisks = extractTopRisks("3 - Exchange Management Plan", null, reportContent);
    
        let formatRisks = risks => risks.map(risk => `${risk.score}: ${risk.recommendation}`).join(', ');
    
        prompt = generatePromptForConsolidatedAssesment(formatRisks(networkRisks), 
                            formatRisks(securityRisks),
                            formatRisks(exchangeRisks))

    }

    if (reportType == "client-health") {
        console.log("cli")
        let risks = extractRisks(reportContent)
        prompt = generateInsights(risks)
    }


    return prompt
}

function extractTopRisks(planName, nextPlanName, reportText) {
    const endBoundary = nextPlanName ? reportText.indexOf(nextPlanName) : reportText.length;
    const startBoundary = reportText.indexOf(planName);
    if (startBoundary === -1 || startBoundary > endBoundary) return [];

    const sectionText = reportText.slice(startBoundary, endBoundary);

    // Regular expression to extract risks (assumed to be two-digit numbers or 100) followed by recommendations.
    const riskRegex = /(100|\d{2})\n([\s\S]+?)(?=(100|\d{2})\n|$)/g;
    const risks = [];
    let match;

    while (match = riskRegex.exec(sectionText)) {
        risks.push({score: parseInt(match[1], 10), recommendation: match[2].trim()});
    }

    // Sort risks by score and take top 10.
    return risks.sort((a, b) => b.score - a.score).slice(0, 10);
}

function extractRisks(reportText) {
    // Use regular expressions to extract high and medium risks
    const highRiskMatch = reportText.match(/High Risk([\s\S]*?)Medium Risk/);
    const mediumRiskMatch = reportText.match(/Medium Risk([\s\S]*?)Low Risk/);

    // Combine the high and medium risk matches into one string
    const risks = `${highRiskMatch ? highRiskMatch[1] : ''}${mediumRiskMatch ? mediumRiskMatch[1] : ''}`;

    return risks.trim(); // Trim any leading/trailing whitespace
}

function generatePromptForConsolidatedAssesment(networkRisks, securityRisks, exchangeRisks) {
    let prompt = `Given the following consolidated report of risks:\n` +
                 `- Network Risks: ${networkRisks}\n` +
                 `- Security Risks: ${securityRisks}\n` +
                 `- Exchange Risks: ${exchangeRisks}\n` +
                 `Which are the first 10 risks that should be prioritized, and in what order, based on their potential to have the most impact in the least amount of time?` + 
                 `Example formatting for each recommendation: ` +
                 `1. [replace with type of risk] Risks:
                 - Risk Score: [replace with risk number]
                 - Recommendation: [replace with recomendation].
                 [replace with empty line between recommendations]
                 `;

    return prompt;
}

function generateInsights(reportContent) {
    let prompt = `Please analyze the report on overall health and unresolved issues of a computer network/system. Provide key insights, including:\n`;
    prompt += `\nPlease present this information in a clear and organized manner to help prioritize actions based on the severity of the identified issues. Show a short summary up front (max 10 lines) and then details`;
    prompt += reportContent;
    return prompt;
}

async function askGpt(promptString) {
    const openai = new OpenAI({
        apiKey: GPT_API_KEY,
        dangerouslyAllowBrowser: true
    })

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "user", "content": promptString}],
    })

    return chatCompletion.choices[0].message.content
}

function show(element) {
    element.style.display = "block"
}

function hide(element) {
    element.style.display = "none"
}

async function generateImage(imageFile) {
    const openai = new OpenAI({
        apiKey: GPT_API_KEY,
        dangerouslyAllowBrowser: true
    })

    const image = await openai.images.edit({
        image: await toFile(imageFile),
        prompt: "Futuristic room full of servers with company logo at the top",
        n: 1,
        size: "512x512",
        response_format: "b64_json"
      });

    return image.data[0].b64_json
}
