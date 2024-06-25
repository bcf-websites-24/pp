<script lang="ts">
    import { ANIMATION_DEFAUTL_DURATION } from "$lib/globals";
    import { Tab } from "bootstrap";
    import { onMount } from "svelte";

    let form_holder_elem: HTMLDivElement;
    let form_login_elem: HTMLFormElement;
    let form_register_elem: HTMLFormElement;
    let register_confirm_password_elem: HTMLInputElement;
    let login_username: string;
    let login_password: string;
    let register_username: string;
    let register_email: string;
    let register_student_id: string;
    let register_password: string;
    let register_confirm_password: string;

    function login(): void
    {
        form_login_elem.reset();
    }

    function register(): void
    {
        if(register_password !== register_confirm_password)
        {
            register_confirm_password_elem.setCustomValidity("Password did not match");

            return;
        }

        form_register_elem.reset();
    }

    function login_tab_clicked(): void
    {
        const old_height: number = form_holder_elem.clientHeight;
        form_login_elem.hidden = false;
        form_register_elem.hidden = true;
        const new_height: number = form_holder_elem.clientHeight;
        form_login_elem.style.opacity = "0";
        const animation: Animation = form_holder_elem.animate(
            [
                {
                    height: old_height + "px",
                    easing: "ease-out"
                },
                {
                    height: new_height + "px",
                    easing: "ease-in"
                }
            ],
            ANIMATION_DEFAUTL_DURATION
        );
        animation.onfinish = (): void =>
        {
            const child_animation: Animation = form_login_elem.animate(
                [
                    {
                        opacity: 0.0,
                        easing: "ease-out"
                    },
                    {
                        opacity: 1.0,
                        easing: "ease-in"
                    },
                ],
                ANIMATION_DEFAUTL_DURATION
            );
            child_animation.onfinish = (): void =>
            {
                form_login_elem.style.opacity = "1";
            };

            child_animation.play();
        };

        animation.play();
    }

    function register_tab_clicked(): void
    {
        const old_height: number = form_holder_elem.clientHeight;
        form_login_elem.hidden = true;
        form_register_elem.hidden = false;
        const new_height: number = form_holder_elem.clientHeight;
        form_register_elem.style.opacity = "0";
        const animation: Animation = form_holder_elem.animate(
            [
                {
                    height: old_height + "px",
                    easing: "ease-out"
                },
                {
                    height: new_height + "px",
                    easing: "ease-in"
                }
            ],
            ANIMATION_DEFAUTL_DURATION
        );
        animation.onfinish = (): void =>
        {
            const child_animation: Animation = form_register_elem.animate(
                [
                    {
                        opacity: 0.0,
                        easing: "ease-out"
                    },
                    {
                        opacity: 1.0,
                        easing: "ease-in"
                    },
                ],
                ANIMATION_DEFAUTL_DURATION
            );
            child_animation.onfinish = (): void =>
            {
                form_register_elem.style.opacity = "1";
            };

            child_animation.play();
        };

        animation.play();
    }

    onMount((): void =>
    {
        
    });
</script>

<div class="stranger-root">
    <div class="stranger-card card card-body shadow m-2">
        <div class="nav nav-pills mb-3">
            <button on:click={login_tab_clicked} class="nav-link active" data-bs-toggle="tab">Login</button>
            <button on:click={register_tab_clicked} class="nav-link" data-bs-toggle="tab">Register</button>
        </div>
        <div bind:this={form_holder_elem} class="align-self-stretch">
            <form bind:this={form_login_elem} action="javascript:">
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="login-username" placeholder="Username" required>
                    <label for="login-username">Username</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="login-password" placeholder="Password" required>
                    <label for="login-password">Password</label>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary">Login</button>
                </div>
            </form>
            <form bind:this={form_register_elem} action="javascript:" hidden>
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="register-username" placeholder="Username" required>
                    <label for="register-username">Username</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="register-email" placeholder="username@mail.com" required>
                    <label for="register-email">Email</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="register-student-id" placeholder="XXXXXXX" required>
                    <label for="register-student-id">Student ID</label>
                </div>
                <div class="form-floating mb-3">
                    <input type="password" class="form-control" id="register-password" placeholder="Password" required>
                    <label for="register-password">Password</label>
                </div>
                <div class="form-floating mb-3">
                    <input bind:this={register_confirm_password_elem} type="password" class="form-control" id="register-confirm-password" placeholder="Confirm Password" required>
                    <label for="register-confirm-password">Confirm Password</label>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary">Register</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .stranger-root
    {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .stranger-card
    {
        max-width: 30rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 0;
    }
</style>