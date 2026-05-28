fetch("http://localhost:3000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company: "Google", role: "Software Engineer", history: [{ role: 'interviewer', text: 'hello' }, { role: 'candidate', text: 'hi' }] })
}).then(res => res.text()).then(text => console.log("RESPONSE:", text)).catch(err => console.error(err));
