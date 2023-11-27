<script lang="ts">
    import { copy2ClipBoard } from "$lib/ultils";
    import Clipboard from "./svgs/Clipboard.svelte";
    import Tux from "./svgs/Tux.svelte";
    import PermissionTable from "./PermissionTable.svelte";
    let permissionInput: HTMLInputElement;
    let symbolic = $state("");
    let invalid = $state(false);
    let isSymbolic = $state(false);
    let recursive = $state(false);
    let chmodSymbolic = $state("");
    let foldername = $state("");

    class SwitchState {
        permission = $state(false);
        id = "";
        key = "-";
        number = 0;
        constructor(id: string) {
            this.id = id;
            this.initSwitchState(id);
        }
        private initSwitchState(id: string): void {
            switch (id.split("_")[1]) {
                case "read":
                    this.number = 4;
                    this.key = "r";
                    break;
                case "write":
                    this.number = 2;
                    this.key = "w";
                    break;
                case "execute":
                    this.number = 1;
                    this.key = "x";
                    break;
                default:
                    this.number = 0;
                    this.key = "-";
                    break;
            }
        }
    }

    const isValid = (input: string) => {
        const regex = /^[-a-zA-Z]([-r][-w][-x]){3}$/;
        return regex.test(input);
    };

    const getNumericValue = (from: number, to: number) => {
        let v = 0;
        for (let i = from; i < to; i++) {
            const switchState = permissionState[i];
            v += switchState.permission ? switchState.number : 0;
        }
        return v;
    };

    const changeSymbolic = (event: KeyboardEvent): void => {
        let x: string = (event.currentTarget as HTMLInputElement).value;
        invalid = !isValid(x);
        if (x.length === 10 && !invalid) {
            for (let i = 1; i < x.length; i++) {
                permissionState[i - 1].permission =
                    x.charAt(i) === permissionState[i - 1].key ? true : false;
            }
        }
    };

    const updateSymbolic = () => {
        let result = "";
        if (permissionInput) {
            result = permissionInput.value;
            for (let i = 0; i < permissionState.length; i++) {
                const ss = permissionState[i];
                let key = ss.permission ? ss.key : "-";
                result =
                    result.substring(0, i + 1) + key + result.substring(i + 2);
            }
            invalid = false;
        }
        return result;
    };

    let permissionState = $state([
        new SwitchState("owner_read"),
        new SwitchState("owner_write"),
        new SwitchState("owner_execute"),
        new SwitchState("group_read"),
        new SwitchState("group_write"),
        new SwitchState("group_execute"),
        new SwitchState("other_read"),
        new SwitchState("other_write"),
        new SwitchState("other_execute"),
    ]);

    let o = $derived(getNumericValue(0, 3));
    let g = $derived(getNumericValue(3, 6));
    let x = $derived(getNumericValue(6, 9));

    const updateChmodSymbolic = () => {
        let chmodValues = "u+";
        for (let i = 0; i < permissionState.length; i++) {
            const ss = permissionState[i];
            if (i === 3) chmodValues += ",g+";
            if (i === 6) chmodValues += ",o+";
            if (ss.permission) chmodValues += ss.key;
        }
        chmodValues = chmodValues.replace(/u\+,|g\+,|o\+,/g, "").toString();
        if (chmodValues.slice(-2) == "o+" || chmodValues == "o+")
            chmodValues = chmodValues.slice(0, -2);
        if (chmodValues.slice(-1) == ",")
            chmodValues = chmodValues.slice(0, -1);
        let all = chmodValues.length == 0 ? "a-rwx" : "a-rwx,";
        return all + chmodValues;
    };

    // effect is used when we want to run a function when a state changes
    $effect(() => {
        symbolic = updateSymbolic();
        chmodSymbolic = updateChmodSymbolic();
    });

    const copySymbolic = async (): Promise<void> =>
        await copy2ClipBoard(permissionInput);
</script>

<div class="page">
    <section>
        <div class="heading-wrapper">
            <Tux></Tux>
            <h1><span class=""> Linux Permission Translator </span></h1>
            <p class="description">
                <span class="underline">
                    Add a file or foldername and choose a command to copy it to
                    your clipboard. <br />
                    Modify the permission with the switches or the octal values below.
                </span>
            </p>
        </div>
        <div class="input-wrapper">
            <input
                id="permissionInput"
                bind:this={permissionInput}
                onkeyup={changeSymbolic}
                value={symbolic}
                type="text"
                aria-invalid={invalid}
            />
            <div class="clip-board">
                <Clipboard
                    --width="2rem"
                    --height="2rem"
                    clip={() => copySymbolic()}
                />
            </div>
        </div>

        <PermissionTable {permissionState} {o} {g} {x} />
      
        <p class="description">
            <span class="underline">
                Add a file or foldername and choose a command to copy it to your
                clipboard.
            </span>
        </p>
        <div class="additional-settings">
            <label for="checkbox_symbolic">
                <input
                    bind:checked={isSymbolic}
                    id="checkbox_symbolic"
                    type="checkbox"
                /> symbolic
            </label>
            <label for="checkbox_recursive">
                <input
                    bind:checked={recursive}
                    id="checkbox_recursive"
                    type="checkbox"
                /> recursive
            </label>
            <input
                class="chmod-filename"
                type="text"
                bind:value={foldername}
                placeholder="enter file- or dirname"
            />
        </div>

        <div class="chmods">
            <div class="chmod chmod-default">
                <p><strong>chmod </strong></p>
                {#if recursive}
                    <p><span class="recursive">-R</span></p>
                {/if}
                <p><span class="flag" /></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } ${chmodSymbolic} ${foldername}`,
                            )}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } ${o}${g}${x} ${foldername}`,
                            )}
                    />
                {/if}
            </div>
            <div class="chmod chmod-silent">
                <p><strong>chmod </strong></p>
                {#if recursive}
                    <p><span class="recursive">-R</span></p>
                {/if}
                <p><span class="flag">--silent</span></p>

                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --silent ${chmodSymbolic} ${foldername}`,
                            )}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --silent ${o}${g}${x} ${foldername}`,
                            )}
                    />
                {/if}
            </div>
            <div class="chmod chmod-verbose">
                <p><strong>chmod </strong></p>
                {#if recursive}
                    <p><span class="recursive">-R</span></p>
                {/if}
                <p><span class="flag">--verbose</span></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --verbose ${chmodSymbolic} ${foldername}`,
                            )}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --verbose ${o}${g}${x} ${foldername}`,
                            )}
                    />
                {/if}
            </div>
            <div class="chmod chmod-changes">
                <p><strong>chmod </strong></p>
                {#if recursive}
                    <p><span class="recursive">-R</span></p>
                {/if}
                <p><span class="flag">--changes</span></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --changes ${chmodSymbolic} ${foldername}`,
                            )}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(
                                `chmod ${
                                    recursive == true ? "-R" : ""
                                } --changes ${o}${g}${x} ${foldername}`,
                            )}
                    />
                {/if}
            </div>
        </div>
    </section>
</div>

<style lang="scss">
    .page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        .description {
            font-size: smaller;
            margin: 0;
            padding: 0;
            color: #959595;
            outline-color: rgb(207, 207, 207);
            font-weight: 300;
            font-size: 0.9rem;
            text-align: center;
        }

        .underline {
            width: calc(100%);
            transition: background-size 1s;
            transition: all 0.3s ease-in-out;
            background-image: linear-gradient(transparent 90%, #be8200 10%);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            line-height: 30px;
        }
        .additional-settings {
            display: flex;
            flex-direction: row;
            justify-content: center;
            width: 100%;
            gap: 1rem;

            label[for="checkbox_recursive"],
            label[for="checkbox_symbolic"] {
                font-size: smaller;
                margin-top: 0.6rem;
            }
            .chmod-filename {
                margin-top: 0.5rem;

                font-size: smaller;
                height: 30px;
                width: auto;
            }
        }

        .chmods {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            max-width: 400px;
            .chmod {
                display: flex;
                justify-content: left;
                align-items: center;
                p {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    display: flex;
                    strong {
                        display: inline-block;
                        min-width: 3rem;
                        color: #1095c1;
                    }
                    .flag {
                        width: 90px;
                        margin-left: 1rem;
                    }
                    .octal,
                    .symbolic {
                        color: #be8200;
                        min-width: 5rem;
                        text-align: center;
                    }
                    .symbolic {
                        width: 100%;
                        word-break: keep-all;
                        text-align: left;
                        padding-inline: 1rem;
                        white-space: nowrap;
                    }
                    .recursive {
                        margin-left: 1rem;
                        text-align: center;
                        word-break: keep-all;
                        white-space: nowrap;
                    }
                    .foldername {
                        color: #be8200;
                        margin-right: 0.5rem;
                    }
                }
                input {
                    margin-left: 1rem;
                }
            }
        }
        section {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            height: 100%;
            width: 100%;
            .heading-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 2rem;
                .tux {
                    height: 4rem;
                }
                h1 {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    text-align: center;
                    inline-size: 100%;
                }
            }
            .input-wrapper {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                min-width: 200px;
                width: 600px;
                #permissionInput {
                    width: 100%;
                    inline-size: 100%;
                    letter-spacing: 0.3rem;
                    margin: 0px;
                }
                margin-bottom: 1rem;
            }
        }
    }

    @media (max-width: 450px) {
        .page {
            section {
                .input-wrapper {
                    width: 100%;
                    #permissionInput {
                        width: 100%;
                        inline-size: 100%;
                        letter-spacing: 0.3rem;
                        margin: 0px;
                    }
                }
            }
            .additional-settings {
                flex-direction: column;
                gap: 0;
            }
            .chmods,
            .chmod {
                width: 100%;
            }
            .chmod {
                overflow-x: scroll;
            }
        }
    }
</style>
