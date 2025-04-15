<script>
	import { db, user } from '$lib/db';
	import { login } from '$lib/ndk';
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">OPENCARD</a>
	</div>
	<div class="flex-none gap-2">
		<div class="form-control">
			<!-- <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" /> -->
		</div>
		{#if $user?.pubkey}
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="avatar btn btn-circle btn-ghost">
					<div class="w-10 rounded-full">
						<img alt="" src={`https://robohash.org/${$user.pubkey}`} />
					</div>
				</div>
				<ul
					tabindex="0"
					class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li>
						<a class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a>Settings</a></li>
					<li><a onclick={() => user.set(null)}>Logout</a></li>
				</ul>
			</div>
		{:else}
			<div class="dropdown dropdown-end">
				<button class="btn">Login</button>
				<ul
					tabindex="0"
					class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
				>
					<li><a onclick={() => login('browser-extension')}>Browser Extension</a></li>
				</ul>
			</div>
		{/if}
	</div>
</div>
