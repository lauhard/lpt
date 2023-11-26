export const copy2ClipBoard = async (element:any ): Promise<void> => {
    let content = '';
    if (element instanceof HTMLInputElement) {
        content = element.value;
    } 

    if (typeof element === 'string') {
        content = element;
    }

    if(content != '') {
        try {
            await navigator.clipboard?.writeText(content).then(
                () => {
                    console.info("[clipboard]: data copied", content);
                },
                (err) => {
                    console.error("[clipboard]: error ", err);
                }
            );
        } catch (error) {   
            console.error("[clipboard]: ", error);
        }
    }
   
};