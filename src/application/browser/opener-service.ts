/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
import { multiInject, injectable } from "inversify";
import Uri from 'vscode-uri';
import URI from "../common/uri";

export const ResourceOpener = Symbol("ResourceOpener");

export interface ResourceOpener {
    /**
     * Open a resource for the given input.
     *
     * Reject if the given input is not a resource input.
     */
    open<ResourceInput = any, Resource = any>(input: ResourceInput | any): Promise<Resource | undefined>;
}

@injectable()
export class OpenerService {

    constructor(
        @multiInject(ResourceOpener) protected readonly openers: ResourceOpener[]
    ) { }

    open<ResourceInput = any, Resource = any>(input: ResourceInput): Promise<Resource | undefined> {
        return this.openWith(0, input);
    }

    protected openWith<ResourceInput, Resource>(index: number, input: ResourceInput): Promise<Resource | undefined> {
        const opener = this.openers[index];
        if (!opener) {
            return Promise.resolve(undefined);
        }
        return opener.open(input).catch(() =>
            this.openWith(index + 1, input)
        );
    }

}

export type UriInput = string | Uri | URI;
export namespace UriInput {
    export function is(input: UriInput | any): input is UriInput {
        return !!input && (input instanceof URI || input instanceof Uri || typeof input === 'string');
    }
    export function asURI(input: UriInput): URI {
        return input instanceof URI ? input : new URI(input);
    }
}
