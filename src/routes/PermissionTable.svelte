<script lang="ts">
    import Switch from "./Switch.svelte";

    let { permissionState, o, g, x } = $props<any>();
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


</script>

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

<style lang="scss">
    table{
        tbody > tr > td {
                position: relative;
            }
        max-width:500px;
        width: 100%;
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
</style>