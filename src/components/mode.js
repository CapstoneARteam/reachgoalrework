export let userMode = true;

export function toggle_usermode() {
    userMode = !userMode;
    return userMode;
}
