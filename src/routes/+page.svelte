<script lang="ts">
    import { copy2ClipBoard } from "$lib/ultils";
    import Clipboard from "./Clipboard.svelte";
    import Switch from "./Switch.svelte";
    let permissionInput: HTMLInputElement;
    let symbolic = $state("");
    let invalid = $state(false);
    let isSymbolic = $state(false);
    let recursive = $state(false);
    let chmodSymbolic =$state("");
    let foldername = $state("");

    const permissionMap = [
        "---",
        "--x",
        "-w-",
        "-wx",
        "r--",
        "r-x",
        "rw-",
        "rwx",
    ];

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
        // const regex = /^[a-zA-Z]([-r][-w][-x]){3}$/;
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

    const changeOctal = (event: Event): void => {
        let { target } = event as any;
        let from = parseInt(target.dataset.from);
        let to = parseInt(target.dataset.to);
        let num = parseInt(target.value);
        let permission = permissionMap[num];
        let permissionBlock = permissionState.slice(from, to);
        for (let i = 0; i < 3; i++)
            permissionBlock[i].permission =
                permission.charAt(i) === "-" ? false : true;
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

    const updateChmodSymbolic = ()=>{
        let chmodValues = "u+";
        for (let i = 0; i < permissionState.length; i++) {
            const ss = permissionState[i];
            if(i === 3) chmodValues += ",g+";
            if(i === 6) chmodValues += ",o+";
            if(ss.permission) chmodValues += ss.key;
        }
        chmodValues = chmodValues.replace(/u\+,|g\+,|o\+,/g, '').toString();
        if(chmodValues.slice(-2) == 'o+' || chmodValues == 'o+'  ) chmodValues = chmodValues.slice(0,-2);
        if(chmodValues.slice(-1) == ',' ) chmodValues = chmodValues.slice(0,-1);
        let all = (chmodValues.length == 0) ? "a-rwx" : "a-rwx,"
        return all + chmodValues;
    }

    // effect is used when we want to run a function when a state changes
    $effect(() => {
        console.log("updatePermissions");
        symbolic = updateSymbolic();
        chmodSymbolic = updateChmodSymbolic();
        console.log("chmodSymbolic", chmodSymbolic);
    });

    // const copyOctal = async (): Promise<void> =>
    //     await copy2ClipBoard(`${o}${g}${x}`);

    const copySymbolic = async (): Promise<void> =>
        await copy2ClipBoard(permissionInput);
</script>

<div class="page">
    <section>
        <div class="heading-wrapper">
            <svg
                class="tux"
                fill="#fff"
                width="100px"
                height="100px"
                viewBox="0 0 24 24"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                    d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 0 1-.004-.021l-.004-.024a1.807 1.807 0 0 1-.15.706.953.953 0 0 1-.213.335.71.71 0 0 0-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 0 0-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 0 0-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 0 0-.205.334 1.18 1.18 0 0 0-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 0 1-.018-.2v-.02a1.772 1.772 0 0 1 .15-.768 1.08 1.08 0 0 1 .43-.533.985.985 0 0 1 .594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 0 0-.166-.267.248.248 0 0 0-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 0 0-.12.27.944.944 0 0 0-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 0 1-.131.068 2.62 2.62 0 0 1-.275-.402 1.772 1.772 0 0 1-.155-.667 1.759 1.759 0 0 1 .08-.668 1.43 1.43 0 0 1 .283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 0 1 .016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 0 1-.448-.067 3.566 3.566 0 0 1-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 0 0-.402-.533 1.45 1.45 0 0 0-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 0 0 .314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 0 1 .647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 0 1-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"
                /></svg
            >
            <h1><span class="">
                Linux Permission Translator
            </span></h1>
            <p class="description">
                <span class="underline">
                    Add a file or foldername and choose a command to copy it to your clipboard. <br>
                    Modify the permission with the switches or the octal values below.
                </span>
            </p>
     
        </div>
        <div class="wrapper">
            <input
                id="permissionInput"
                bind:this={permissionInput}
                onkeyup={changeSymbolic}
                value={symbolic}
                type="text"
                aria-invalid={invalid}
            />
            <div class="clip-board">
                <svg
                    onmousedown={copySymbolic}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-clipboard-check"
                    ><rect
                        width="8"
                        height="4"
                        x="8"
                        y="2"
                        rx="1"
                        ry="1"
                    /><path
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                    /><path d="m9 14 2 2 4-4" /></svg
                >
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th scope="col">Owner</th>
                    <th scope="col">Group</th>
                    <th scope="col">Other</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <Switch
                            {permissionState}
                            id={"owner_read"}
                            name="read"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"group_read"}
                            name="read"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"other_read"}
                            name="read"
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <Switch
                            {permissionState}
                            id={"owner_write"}
                            name="write"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"group_write"}
                            name="write"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"other_write"}
                            name="write"
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <Switch
                            {permissionState}
                            id={"owner_execute"}
                            name="execute"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"group_execute"}
                            name="execute"
                        />
                    </td>
                    <td>
                        <Switch
                            {permissionState}
                            id={"other_execute"}
                            name="execute"
                        />
                    </td>
                </tr>
                <tr class="result">
                    <td>
                        <input
                            type="number"
                            min="0"
                            max="7"
                            name="owner1"
                            data-from="0"
                            data-to="3"
                            value={o}
                            onkeyup={changeOctal}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            min="0"
                            max="7"
                            name="owner2"
                            data-from="3"
                            data-to="6"
                            value={g}
                            onkeyup={changeOctal}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            min="0"
                            max="7"
                            name="owner3"
                            data-from="6"
                            data-to="9"
                            value={x}
                            onkeyup={changeOctal}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
        <p class="description">
            <span class="underline">
                Add a file or foldername and choose a command to copy it to your clipboard.

            </span>
        </p>
        <div class="additional-settings">
           
            <label for="checkbox_symbolic">
                <input
                    bind:checked={isSymbolic}
                    id="checkbox_symbolic"
                    type="checkbox"
                /> symbolic values
            </label>
            <label for="checkbox_recursive">
                <input
                    bind:checked={recursive}
                    id="checkbox_recursive"
                    type="checkbox"
                /> recursive
            </label>
            <input class="chmod-filename" type="text" bind:value={foldername} placeholder="enter file- or dirname">
        </div>
      
        <div class="chmods">
            
            <div class="chmod chmod-default">
                <p><strong>chmod </strong></p>
                {#if recursive} <p><span class="recursive">-R</span></p>   {/if}
                <p><span class="flag" /></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() => copy2ClipBoard(`chmod ${recursive==true?'-R':''} ${chmodSymbolic} ${foldername}`)}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() => copy2ClipBoard(`chmod ${recursive==true?'-R':''} ${o}${g}${x} ${foldername}`)}
                    />
                {/if}
            </div>
            <div class="chmod chmod-silent">
                <p><strong>chmod </strong></p>
                {#if recursive} <p><span class="recursive">-R</span></p>   {/if}
                <p><span class="flag">--silent</span></p>

                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --silent ${chmodSymbolic} ${foldername}`)}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --silent ${o}${g}${x} ${foldername}`)}
                    />
                {/if}

            </div>
            <div class="chmod chmod-verbose">
                <p><strong>chmod </strong></p>
                {#if recursive} <p><span class="recursive">-R</span></p>   {/if}
                <p><span class="flag">--verbose</span></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --verbose ${chmodSymbolic} ${foldername}`)}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --verbose ${o}${g}${x} ${foldername}`)}
                    />
                {/if}
            </div>
            <div class="chmod chmod-changes">
                <p><strong>chmod </strong></p>
                {#if recursive} <p><span class="recursive">-R</span></p>   {/if}
                <p><span class="flag">--changes</span></p>
                {#if isSymbolic == true}
                    <p><span class="symbolic">{chmodSymbolic}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --changes ${chmodSymbolic} ${foldername}`)}
                    />
                {:else}
                    <p><span class="octal">{o}{g}{x}</span></p>
                    <p><span class="foldername">{foldername}</span></p>
                    <Clipboard
                        --width="1.3rem"
                        --height="1.3rem"
                        clip={() =>
                            copy2ClipBoard(`chmod ${recursive==true?'-R':''} --changes ${o}${g}${x} ${foldername}`)}
                    />
                {/if}
            </div>
        </div>
    </section>
</div>

<style lang="scss">
   .description {
        font-size: smaller;
        margin: 0;
        padding: 0;
        color: #b5babf;
        font-weight: 300;
        font-size: .9rem;
        // text-align: center;
        // width: 100%;
        // max-width: 600px;
        border-bottom: #be8200 2px solid;
       
    }
    .underline:hover {
    
    }
    .underline {
  /* I don't know why this is needed, I just added it and it worked in IE Edge. If we remove this width, the gradient breaks in IE Edge */
  width: calc(100%);
//   background-image: linear-gradient(transparent calc(100% - 10px), #1095c144 10px);
//   background-repeat: no-repeat;
//   background-size: 100% 100%;
  transition: background-size 1s;
transition: all 0.3s ease-in-out;
        background-image: linear-gradient(transparent calc(100% - 20px), #be8200 120px);
        background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 0 0px;

}

    .page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        .additional-settings {
            display: flex;
            flex-direction: row;
            width: 100%;
            gap: 1rem;

            label[for="checkbox_recursive"], label[for="checkbox_symbolic"]  {
                font-size: smaller;
                margin-top:0.6rem;
                // padding: 0;
            }
            .chmod-filename{
                margin-top: .5rem;

                font-size: smaller;
                height: 30px;
                width: auto;
            }
        }
     
      
        .chmods {
            display: flex;
            flex-direction: column;
            justify-content: left;
            align-items: left;
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
                        color: #1095C1;
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
                        // margin-inline: 0.5rem;
                    }
                    .symbolic {
                        // max-width: 12.5rem;
                        width: 100%;
                        // min-width: 10rem;
                        word-break:keep-all;
                        // max-height: 40px;
                        text-align: left;
                        padding-inline: 1rem;
                        white-space: nowrap;
                        // overflow: hidden;
                    }
                    .recursive{
                        margin-left: 1rem;
                        text-align: center;
                        word-break:keep-all;
                        white-space: nowrap;

                    }
                    .foldername{
                        color: #be8200;
                        margin-right: .5rem;
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
                    // margin-inline: auto;
                    width: 100%;
                    text-align: center;
                    inline-size: 100%;
                    // margin-block: 0.5rem;
                }
               
            }
            .wrapper {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                #permissionInput {
                    width: 100%;
                    inline-size: 100%;
                    letter-spacing: 0.3rem;
                    margin: 0px;
                }
                margin-bottom: 1rem;
            }
            .clip-board {
                position: relative;
                margin-left: 1rem;
                svg {
                    width: 2rem;
                    height: 2rem;
                    transition: all 0.3s ease-in-out;
                }
                :hover {
                    cursor: pointer;
                    color: #be8200;
                    transition: all 0.3s ease-in-out;
                }
            }
            table > tbody > tr > td {
                position: relative;
            }
            .clip-board-octal {
                position: absolute;
                margin-left: 1rem;
                top: 60%;
                transform: translateY(-60%);
                right: -1rem;
                svg {
                    width: 3rem;
                    height: 3rem;
                    transition: all 0.3s ease-in-out;
                }
                :hover {
                    cursor: pointer;
                    color: #be8200;
                    transition: all 0.3s ease-in-out;
                }
            }
            table {
                .result {
                    input {
                        font-weight: bold;
                        font-size: 5rem;
                        color: #be8200;
                        border: none;
                        height: 6rem;
                        width: 6rem;
                        display: inline-block;
                        text-align: center;
                    }
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                        appearance: textfield;
                        margin: 0;
                    }
                }
            }
        }
    }
</style>
