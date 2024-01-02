# C# Code Template Generator Extension for Visual Studio Code

## Overview

The C# Code Template Generator is a Visual Studio Code extension designed to streamline the process of creating boilerplate code for C# projects. It provides a set of templates for commonly used C# patterns, reducing the time and effort required to set up the initial structure of your code.


https://github.com/sahilmankar/vscode-cshrap-templates/assets/110836726/188d8bdc-2156-4e72-92f1-7b52455781cf


## Features

- Generate C# code templates for common patterns and structures.
- Customizable templates to suit your project's specific requirements.
- Integration with Visual Studio Code for a seamless development experience.

## Installation
1. Clone repo or download `csharp-templates-0.0.1.vsix` file
1. Install extension by running command in downloaded directory.

```bash 
code --install-extension  .\csharp-templates-0.0.1.vsix
```

## Usage

1. Right click a directory Select option Add C# File.
2. After Selecting template and providing filename it will create file.
3. It will take namespace name either from sibling file or create by folder strcture from root to newly created file directory.


## Available Templates

`class`,`controller`,`interface` Are availabel templates.
- You can check [here](/templates/) for templates 
or you can also add template in that directory and also add in [this](/src/templates.ts) file.

- There's another extension I've found to be more effective than this one . It comes with some extra features you might find interesting.
[check here ](https://github.com/tobias-tengler/csharper)

