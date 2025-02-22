/**
 * Generated by the protoc-gen-ts.  DO NOT EDIT!
 * compiler version: 5.27.1
 * source: folders.proto
 * git: https://github.com/thesayyn/protoc-gen-ts */
import * as pb_1 from "google-protobuf";
export namespace api {
    export class Folders extends pb_1.Message {
        #one_of_decls: number[][] = [[2]];
        constructor(data?: any[] | ({
            name?: string;
            children?: Folders[];
        } & (({
            root?: boolean;
        })))) {
            super();
            pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [3], this.#one_of_decls);
            if (!Array.isArray(data) && typeof data == "object") {
                if ("name" in data && data.name != undefined) {
                    this.name = data.name;
                }
                if ("root" in data && data.root != undefined) {
                    this.root = data.root;
                }
                if ("children" in data && data.children != undefined) {
                    this.children = data.children;
                }
            }
        }
        get name() {
            return pb_1.Message.getFieldWithDefault(this, 1, "") as string;
        }
        set name(value: string) {
            pb_1.Message.setField(this, 1, value);
        }
        get root() {
            return pb_1.Message.getFieldWithDefault(this, 2, false) as boolean;
        }
        set root(value: boolean) {
            pb_1.Message.setOneofField(this, 2, this.#one_of_decls[0], value);
        }
        get has_root() {
            return pb_1.Message.getField(this, 2) != null;
        }
        get children() {
            return pb_1.Message.getRepeatedWrapperField(this, Folders, 3) as Folders[];
        }
        set children(value: Folders[]) {
            pb_1.Message.setRepeatedWrapperField(this, 3, value);
        }
        get _root() {
            const cases: {
                [index: number]: "none" | "root";
            } = {
                0: "none",
                2: "root"
            };
            return cases[pb_1.Message.computeOneofCase(this, [2])];
        }
        static fromObject(data: {
            name?: string;
            root?: boolean;
            children?: ReturnType<typeof Folders.prototype.toObject>[];
        }): Folders {
            const message = new Folders({});
            if (data.name != null) {
                message.name = data.name;
            }
            if (data.root != null) {
                message.root = data.root;
            }
            if (data.children != null) {
                message.children = data.children.map(item => Folders.fromObject(item));
            }
            return message;
        }
        toObject() {
            const data: {
                name?: string;
                root?: boolean;
                children?: ReturnType<typeof Folders.prototype.toObject>[];
            } = {};
            if (this.name != null) {
                data.name = this.name;
            }
            if (this.root != null) {
                data.root = this.root;
            }
            if (this.children != null) {
                data.children = this.children.map((item: Folders) => item.toObject());
            }
            return data;
        }
        serialize(): Uint8Array;
        serialize(w: pb_1.BinaryWriter): void;
        serialize(w?: pb_1.BinaryWriter): Uint8Array | void {
            const writer = w || new pb_1.BinaryWriter();
            if (this.name.length)
                writer.writeString(1, this.name);
            if (this.has_root)
                writer.writeBool(2, this.root);
            if (this.children.length)
                writer.writeRepeatedMessage(3, this.children, (item: Folders) => item.serialize(writer));
            if (!w)
                return writer.getResultBuffer();
        }
        static deserialize(bytes: Uint8Array | pb_1.BinaryReader): Folders {
            const reader = bytes instanceof pb_1.BinaryReader ? bytes : new pb_1.BinaryReader(bytes), message = new Folders();
            while (reader.nextField()) {
                if (reader.isEndGroup())
                    break;
                switch (reader.getFieldNumber()) {
                    case 1:
                        message.name = reader.readString();
                        break;
                    case 2:
                        message.root = reader.readBool();
                        break;
                    case 3:
                        reader.readMessage(message.children, () => pb_1.Message.addToRepeatedWrapperField(message, 3, Folders.deserialize(reader), Folders));
                        break;
                    default: reader.skipField();
                }
            }
            return message;
        }
        serializeBinary(): Uint8Array {
            return this.serialize();
        }
        static deserializeBinary(bytes: Uint8Array): Folders {
            return Folders.deserialize(bytes);
        }
    }
}
