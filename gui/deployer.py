import streamlit as st

st.title("🚀 ProjectPilotAI Deploy GUI")
path = st.text_input("Project Path")
if st.button("Run Analysis"):
    st.write(summarize_codebase(path))
