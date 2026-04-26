package com.example;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.*;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;


public class App {
  public static void main(String[] args) {
    String apiKey = System.getenv("GEMINI_API_KEY");
    Client client = Client.builder().apiKey(apiKey).build();
    Gson gson = new Gson();

    List<Tool> tools = new ArrayList<>();
    tools.add(
      Tool.builder()
        .urlContext(
          UrlContext.builder().build()
        )
        .build()
    );
    tools.add(
      Tool.builder().codeExecution(ToolCodeExecution.builder().build()).build()
    );
    tools.add(
      Tools.builder()
        .googleSearch(
          GoogleSearch.builder()
              .build())
            .build()
    );

    String model = "gemini-3-flash-preview";
    List<Content> contents = ImmutableList.of(
      Content.builder()
        .role("user")
        .parts(ImmutableList.of(
          Part.fromText("INSERT_INPUT_HERE")
        ))
        .build()
    );
    GenerateContentConfig config =
      GenerateContentConfig
      .builder()
      .temperature(0.55f)
      .topP(0.55f)
      .thinkingConfig(
        ThinkingConfig
          .builder()
          .thinkingLevel("HIGH")
          .build()
      )
      .mediaResolution("MEDIA_RESOLUTION_HIGH")
      .tools(tools)
      .build();

    ResponseStream<GenerateContentResponse> responseStream = client.models.generateContentStream(model, contents, config);

    for (GenerateContentResponse res : responseStream) {
      if (res.candidates().isEmpty() || res.candidates().get().get(0).content().isEmpty() || res.candidates().get().get(0).content().get().parts().isEmpty()) {
        continue;
      }

      List<Part> parts = res.candidates().get().get(0).content().get().parts().get();
      for (Part part : parts) {
        if (part.text().isPresent()) {
          System.out.println(part.text().get());
        }
        if (part.executableCode().isPresent()) {
          System.out.println(part.executableCode().get());
        }
        if (part.codeExecutionResult().isPresent()) {
          System.out.println(part.codeExecutionResult().get());
        }
      }
    }

    responseStream.close();
  }
}
