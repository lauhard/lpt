<script lang="ts">
    //create type of permission
    type Permission = {
        id: string;
        name: string;
        permission: boolean;
    };
    let { permissionState, id, name } = $props<any>();
    let permission = permissionState.find((p: Permission) => p.id === id);
</script>

<label for="switch">
    <input
        bind:checked={permission.permission}
        type="checkbox"
        {id}
        {name}
        role="switch"
    />
    {name}
</label>