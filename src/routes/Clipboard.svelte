<script>
    export const { clip } = $props();
    // your script goes here
</script>


<div class="clipboard">
    <svg
        onmousedown={()=>{
            if(!clip) return;
           clip?.();

        }}
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

<style lang="scss">
    .clipboard {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: .2rem;
        svg {
            width: var(--width, 2rem);
            height: var(--height, 2rem);
            transition: all 0.3s ease-in-out;
        }
        :hover {
            cursor: pointer;
            color: #be8200;
            transition: all 0.3s ease-in-out;
        }
    }
</style>