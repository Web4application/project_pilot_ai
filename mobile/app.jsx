import React, { useState } from "react";
import { SafeAreaView, TextInput, Button, ScrollView, Text } from "react-native";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  async function generate() {
    const res = await fetch("https://api.pilotai.io/generate_react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: input })
    });
    const json = await res.json();
    setOutput(json.generated_code);
  }

  return (
    <SafeAreaView style={{ padding: 20, flex: 1 }}>
      <TextInput
        style={{ height: 120, borderColor: "gray", borderWidth: 1, marginBottom: 10 }}
        multiline
        value={input}
        onChangeText={setInput}
      />
      <Button title="Generate React Component" onPress={generate} />
      <ScrollView style={{ marginTop: 20 }}>
        <Text style={{ color: "#0f0" }}>{output}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
