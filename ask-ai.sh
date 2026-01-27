#!/bin/bash
# Quick script to use DeepSeek Coder for coding tasks
# Usage: ./ask-ai.sh "your question here"

if [ -z "$1" ]; then
    echo "Usage: ./ask-ai.sh 'your coding question'"
    echo "Example: ./ask-ai.sh 'write a React hook for form validation'"
    exit 1
fi

ollama run deepseek-coder "$1"
