async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/3c2d8a9226729b067992b8515d7c2a75/ai/run/${model}`,
    {
      headers: { Authorization: "Bearer aVZM8HSx1lrFNqUj7Zmo_3ZkAMUwxjuI4QUHcStS" },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  const result = await response.json();
  return result;
}


run("@cf/meta/llama-3-8b-instruct", {
  messages: [
    {
      role: "system",
      content: "You are a friendly assistan that helps write stories",
    },
    {
      role: "user",
      content:
        "Write a short story about a llama that goes on a journey to find an orange cloud ",
    },
  ],
}).then((response) => {
  console.log(JSON.stringify(response));
});
