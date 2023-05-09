# Changelog

## 1.0.0 (2023-05-09)


### ⚠ BREAKING CHANGES

* decoupling + more dynamic imports
* migrated ninetyNine store storage
* property migration
* migrated schema for property and saved + logger overhaul
* **account:** agent registration option
* **account:** added reset password
* **redis:** added checks for cache decay
* **account:** fleshed out update fields
* **prisma:** revert back to psql due to oauth breaking
* added redis cache
* **prisma:** migrate to mysql
* **explore:** added new launches preview
* user delete + update (partial)
* user password auth
* **wip:** explore
* base nav overhaul
* migrated to es6 map
* dynamic routing for property types, id

### Features

* **account:** added reset password ([69f67ef](https://github.com/crystalcheong/homey/commit/69f67ef75f814bb3fea9b6b1bfadce8077130666))
* **account:** agent registration option ([d600d65](https://github.com/crystalcheong/homey/commit/d600d6521b23ffc1d0b3b6a39cc59c728682e643))
* **account:** fleshed out update fields ([3eea5c5](https://github.com/crystalcheong/homey/commit/3eea5c53e6b4f190af18d02f52958be7a78e15e7))
* **account:** update profile image ([406920e](https://github.com/crystalcheong/homey/commit/406920ee79dec3e88469d456d0b49df2c62fc596))
* add wip banner ([62d8c72](https://github.com/crystalcheong/homey/commit/62d8c722c36a2d8b9630fa7550b0185a5f7b9789))
* added auth page tests ([600f7e4](https://github.com/crystalcheong/homey/commit/600f7e431874080333d8fdec06e4f294bb39df96))
* added custom logo loader ([0e0861d](https://github.com/crystalcheong/homey/commit/0e0861da7061b6e77a055595b119c7f47dd669b9))
* added footer ([f352b1a](https://github.com/crystalcheong/homey/commit/f352b1ac169361d7739164872121042616bf9d90))
* added info pages ([a76d998](https://github.com/crystalcheong/homey/commit/a76d9981a66d734eb0a44967788d299b1e0154ce))
* added join cta in explore submenu ([9d47447](https://github.com/crystalcheong/homey/commit/9d4744707046ab18f9fc8213029b080e8eadd43e))
* added listing cta + cleanup ([7fac32a](https://github.com/crystalcheong/homey/commit/7fac32adaa402b68a879a03cb6149ac6693a833d))
* added listing type fallback ([efd3bec](https://github.com/crystalcheong/homey/commit/efd3bec6c663df2bb97561cf275c22f29816582f))
* added listing view modes ([a3064ed](https://github.com/crystalcheong/homey/commit/a3064ed0d8dbf7675e75e8dc000d2baa4639b12a))
* added map listing backlink ([c23ec48](https://github.com/crystalcheong/homey/commit/c23ec48b9623da8c5950eee90cb459452d2d99d3))
* added pagination ([7dfb8da](https://github.com/crystalcheong/homey/commit/7dfb8dacfd7c866c2616e43c6221a352d2539d51))
* added redis cache ([8a59e64](https://github.com/crystalcheong/homey/commit/8a59e64dec46c9cb92eb615dae1b74948ad87f77))
* added soon badge ([4ace58b](https://github.com/crystalcheong/homey/commit/4ace58b60cf455dce7e2e6d688127715c00d3f7d))
* added static error pages for deployment ([23d6118](https://github.com/crystalcheong/homey/commit/23d61180bc04c96ddd4ed428635995acff282c1f))
* added unavailability removal ([ddc3b0a](https://github.com/crystalcheong/homey/commit/ddc3b0a86ddb15b7c6f44d7918be8d76c8c52253))
* auth requirement for saved listing ([6f79f26](https://github.com/crystalcheong/homey/commit/6f79f261ad7cd4f0e46b1ed9d75d1716618fc9cb))
* **auth:** added credentials provider ([75dd17b](https://github.com/crystalcheong/homey/commit/75dd17b7cee68661acd9b06d9ff10512ff848982))
* **auth:** shifted cfm password ([273fa7a](https://github.com/crystalcheong/homey/commit/273fa7af453d4d808930ee849ab4847082ab412d))
* auto redirection countdown for unknown states ([207cada](https://github.com/crystalcheong/homey/commit/207cada81c537d1d1e59b043587d819f0aab9cb8))
* base nav overhaul ([36eb2d0](https://github.com/crystalcheong/homey/commit/36eb2d0c68614a33f41c5ae66e1b795a9ca977ff))
* **beta:** updated beta tag ([0eb62be](https://github.com/crystalcheong/homey/commit/0eb62beff16ad60df4b1a45bcc30e398ce4e8e1d))
* drafted neighbourhood info into listing ([38d18c6](https://github.com/crystalcheong/homey/commit/38d18c6d6129a2da158a00f7a41f8fe4fe352e40))
* drafted posted ([77d784b](https://github.com/crystalcheong/homey/commit/77d784bf73affb72697be413b4e7ba68bc4974ea))
* drafted price range ([ca91f44](https://github.com/crystalcheong/homey/commit/ca91f44e731b2787b9ad26cb7556ab246cf4c679))
* dynamic routing for property types, id ([b05ba23](https://github.com/crystalcheong/homey/commit/b05ba232841d6eda62c28869ff2c53d03da10564))
* **explore:** added new launches preview ([be1946a](https://github.com/crystalcheong/homey/commit/be1946aadeec57e9aceacbcb27a74a5046a31863))
* **explore:** fleshed out area info ([1a1f17f](https://github.com/crystalcheong/homey/commit/1a1f17f49642cdd65c770dca5ad50942af6914fa))
* **explore:** view new launches ([0d39c4d](https://github.com/crystalcheong/homey/commit/0d39c4d636a70c3c5830894536e9d07dfb7bb600))
* fallback listing state + offloaded nav placeholders ([207f5d6](https://github.com/crystalcheong/homey/commit/207f5d641371dba42ba81bb7279dcc779ec68d36))
* fleshed out auth forms tests ([628f9d2](https://github.com/crystalcheong/homey/commit/628f9d29d7aadfa5f85b22f8351f6d1f8b41c5de))
* generated sitemap ([75c808d](https://github.com/crystalcheong/homey/commit/75c808d8a582823794f8c532a9c63b89fd1a115f))
* initialized w/ t2/3 stack ([99f5f4e](https://github.com/crystalcheong/homey/commit/99f5f4e47d34b586e0c917e05cbbeab0fe6cca43))
* integrated pwa ([e4a4440](https://github.com/crystalcheong/homey/commit/e4a4440d61c3b75f6ea7dd5c00e97afbcdc62069))
* **listing:** added faq section ([9ab5de0](https://github.com/crystalcheong/homey/commit/9ab5de0b9761cca85ffd270e2a701a0e7a958f9d))
* **listings:** added filters ([c36a046](https://github.com/crystalcheong/homey/commit/c36a04652c0d5153a54e62ffded7a1701af7ee40))
* **listing:** semi-fleshed out details ([9dcb01d](https://github.com/crystalcheong/homey/commit/9dcb01dfcce5f78933bdf386b45af2c6def33c1e))
* **listing:** similar listings preview ([657b4e1](https://github.com/crystalcheong/homey/commit/657b4e113bf375cb00fb04493c1ae2eb084d4b88))
* **listings:** store mutator to invoke trpc proxy ([ded967e](https://github.com/crystalcheong/homey/commit/ded967eab306e8ac07c826f905e22551d3f9fcdd))
* migrated ninetyNine store storage ([fa469b2](https://github.com/crystalcheong/homey/commit/fa469b2c72d8652f32887a5fa9932cd08ff44fb4))
* migrated schema for property and saved + logger overhaul ([20a81b7](https://github.com/crystalcheong/homey/commit/20a81b74caf429c8e6b5bca9ad2ec4457e0f0e7c))
* migrated to es6 map ([8cf8fa7](https://github.com/crystalcheong/homey/commit/8cf8fa7b1d93e8cc7d0624ccca3dd7d44f050b1b))
* minor tweaks ([2633e5c](https://github.com/crystalcheong/homey/commit/2633e5ccce801112ff82e876c03a87fa0f98061a))
* **nav:** updated navbar mobile responsiveness ([3e087b8](https://github.com/crystalcheong/homey/commit/3e087b8b82cbcc9dbb155d85f9869e247278e4b0))
* omitted beta tag ([c52fbab](https://github.com/crystalcheong/homey/commit/c52fbab1b105709c321db53a3e2f8027f4c76e5b))
* **prisma:** migrate to mysql ([84c8240](https://github.com/crystalcheong/homey/commit/84c82400b1b783e92153787f5ba816d14e27a136))
* **property:** fetch specific listing w/ clusterId ([5c6cc17](https://github.com/crystalcheong/homey/commit/5c6cc17d42566038fb71df7b4ff4ab458843f0f3))
* **redis:** added checks for cache decay ([1f2b6ac](https://github.com/crystalcheong/homey/commit/1f2b6ac95dfb262b3d0ab48866879767a4c793f5))
* revamp + embedded maps ([8c046ff](https://github.com/crystalcheong/homey/commit/8c046ff04e48e88d140e91623a12ce1fa7ac0cc1))
* revamped footer ([90c98f2](https://github.com/crystalcheong/homey/commit/90c98f24d2564d9f6e9b0db3ee430e68905ea96c))
* **saved:** added user saved listings ([809fd5d](https://github.com/crystalcheong/homey/commit/809fd5d3af2052f4c148d7558edab502813e84a2))
* **search:** area search + page states assets ([07d327d](https://github.com/crystalcheong/homey/commit/07d327d25a926d4851c055930032940168180739))
* serialize property when saved ([85a8ede](https://github.com/crystalcheong/homey/commit/85a8edede54745dcaed45440832d859482c785f8))
* tweaked save btn ([d816273](https://github.com/crystalcheong/homey/commit/d81627380c6767bcded6eeb5a3e02368fe798f8a))
* **update-account:** dynamic profile image action ([7a6302e](https://github.com/crystalcheong/homey/commit/7a6302e308337d20666ae55c876c3e770e6b5d44))
* updated agent verification ([a8e08f4](https://github.com/crystalcheong/homey/commit/a8e08f4773f2c1b136f0acff98d03b57ec2230bd))
* updated config + added security headers ([4697d80](https://github.com/crystalcheong/homey/commit/4697d80cf4abc5a933a10960fa226925db4024da))
* updated datasource ([c663f2c](https://github.com/crystalcheong/homey/commit/c663f2c12df3572b2919012cba2e02784d0d3f10))
* updated footer links ([0dab702](https://github.com/crystalcheong/homey/commit/0dab70282b8cecd591e089e9794da874cbef4174))
* updated nav cta ([74f03a7](https://github.com/crystalcheong/homey/commit/74f03a78f3f02ec159a4659dc74d17cf4ef6b931))
* user delete + update (partial) ([33a3d0a](https://github.com/crystalcheong/homey/commit/33a3d0ac9361066ee119ec849a11cfd5048c0935))
* user password auth ([76b3429](https://github.com/crystalcheong/homey/commit/76b342982a5c4327f8901c67e2e9295a0fff07af))
* **wip:** explore ([00bb47d](https://github.com/crystalcheong/homey/commit/00bb47da2b0d7ff0aa5faccd372bf8b9dca96685))


### Bug Fixes

* **account:** patched hook depths ([24c6110](https://github.com/crystalcheong/homey/commit/24c61102de23f268ec2a066ffa4663188174d6b5))
* **auth:** failed signIn infinite loader ([8a6f03b](https://github.com/crystalcheong/homey/commit/8a6f03ba374a3235e221dd6db94aad64d12d7d2e))
* **auth:** findFirst deadblock ([17b43d9](https://github.com/crystalcheong/homey/commit/17b43d9d3490c102d0030f61aeec012a5b2d2ad1))
* **auth:** patched state persistance ([9615a94](https://github.com/crystalcheong/homey/commit/9615a94d0a94f410fa695c590eb24102d3edeba8))
* **auth:** permisstic shadowing of authErrorState ([696cccf](https://github.com/crystalcheong/homey/commit/696cccf9d53d0866cc38ae43e6d40ddce39ac80f))
* cea validation ([6bbcd06](https://github.com/crystalcheong/homey/commit/6bbcd067536e2c3b84ecf26ca30f55f924a5f59a))
* close drawer when redirected ([afb5141](https://github.com/crystalcheong/homey/commit/afb51416a114c46b19e8c01e13675408145870f7))
* **docs:** specified res headers ([b45faf3](https://github.com/crystalcheong/homey/commit/b45faf39b2469536dff153c91ed9b71c4e4dc07d))
* **gov:** patch validation switch ([a02a3d3](https://github.com/crystalcheong/homey/commit/a02a3d3ee29d1d6684d391a0a8665980efb63525))
* **listing:** patch cluster listing state ([93f0786](https://github.com/crystalcheong/homey/commit/93f07860e110f1e0f6bb90b977b5518306af4333))
* **neighbourhood:** patched prisma migration ([78d3059](https://github.com/crystalcheong/homey/commit/78d305972131e4de47bc327e5b668c72a11a416e))
* **oauth:** updated schema for cascading deletion ([f2b5d66](https://github.com/crystalcheong/homey/commit/f2b5d66e34c44c6c151a5186d628d64932605623))
* omitted pagination cache ([b38633c](https://github.com/crystalcheong/homey/commit/b38633cc376a1c76fee41ed1b6813516f5732416))
* patched copy link ([bd74a5a](https://github.com/crystalcheong/homey/commit/bd74a5ad4048d8898cf2d09beb7067f14fd44c45))
* patched direct listing search ([6d5e330](https://github.com/crystalcheong/homey/commit/6d5e3309f6df9bce3e6c94926e3e0bc15070c441))
* **prisma:** revert back to psql due to oauth breaking ([cd9576a](https://github.com/crystalcheong/homey/commit/cd9576a4aa0ea63af291ffe54fdb11112e0f41a6))
* property migration ([96a5439](https://github.com/crystalcheong/homey/commit/96a5439f3d6b245f61687b3e180e461bf014f365))
* **search:** tweaked location multiselect styles ([4abb7a6](https://github.com/crystalcheong/homey/commit/4abb7a652aea23d83074d75720e6d4c282081b01))
* update imports ([c4a7046](https://github.com/crystalcheong/homey/commit/c4a70464414ea608fece8da1108a98b68f7ad163))
* updated beta flag ([1fd8f05](https://github.com/crystalcheong/homey/commit/1fd8f057065ba82bb91cf2f17613d874206234cc))


### Code Refactoring

* decoupling + more dynamic imports ([b76cfe1](https://github.com/crystalcheong/homey/commit/b76cfe1b956a8ef9e0d41dc4724d64948a051d43))
