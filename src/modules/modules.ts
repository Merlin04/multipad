import path from 'path';
import MarkdownModule from './MarkdownModule';
import MonacoModule from './MonacoModule';
import ImageModule from './ImageModule';

export interface ModuleProps {
    lastSave: Date | undefined,
    newToggle: boolean | undefined
}

export enum ModuleOption {
    Monaco,
    Markdown,
    Image
}

export interface GetModuleOptionsResults {
    top?: ModuleOption,
    seconds?: ModuleOption[],
    remaining?: ModuleOption[]
}

export function getModuleOptions(filePath: string): GetModuleOptionsResults {
    const ext = path.extname(filePath);
    if([".md", ".markdown", ".mdown"].includes(ext)) {
        return {
            top: ModuleOption.Markdown,
            seconds: [
                ModuleOption.Monaco
            ],
            remaining: [
                ModuleOption.Image
            ]
        }
    }
    else if([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        return {
            top: ModuleOption.Image,
            remaining: [
                ModuleOption.Monaco,
                ModuleOption.Markdown
            ]
        }
    }
    else {
        return {
            top: ModuleOption.Monaco,
            seconds: [
                ModuleOption.Markdown
            ],
            remaining: [
                ModuleOption.Image
            ]
        }
    }
}

export function moduleOptionToModule(option: ModuleOption) {
    switch(option) {
        case ModuleOption.Monaco: {
            return MonacoModule;
        }
        case ModuleOption.Markdown: {
            return MarkdownModule;
        }
        case ModuleOption.Image: {
            return ImageModule;
        }
    }
}

export function getNameOfOption(option: ModuleOption) {
    switch(option) {
        case ModuleOption.Monaco: {
            return "Code";
        }
        case ModuleOption.Markdown: {
            return "Markdown";
        }
        case ModuleOption.Image: {
            return "Image";
        }
    }
}