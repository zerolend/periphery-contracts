// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.12;

import "forge-std/Test.sol";
import {RewardsController} from "contracts/rewards/RewardsController.sol";
import {IERC20} from '@zerolendxyz/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol';

interface IRewardsController {
    function getAllUserRewards(address[] calldata assets, address user) external view
        returns (address[] memory, uint256[] memory);
    function claimRewards(address[] calldata assets, uint256 amount, address to, address reward) external
        returns (uint256);
    function claimAllRewards(address[] calldata assets, address to) external
        returns (address[] memory, uint256[] memory);
    function upgradeTo(address newImplementation) external;
}

contract ClaimRewardsForkTest is Test {
    address private constant REWARDS_CONTROLLER_PROXY = 0x28F6899fF643261Ca9766ddc251b359A2d00b945;
    address private constant IMPERSONATED_USER = 0xbB226555fBB98850273B10b0CF55aD2f99966d20;
    address private constant ERC20_TOKEN = 0x78354f8DcCB269a615A7e0a24f9B0718FDC3C7A7;
    address private constant ADMIN_MULTISIG = 0xC44827C51d00381ed4C52646aeAB45b455d200eB;
    address private constant EMISSIONS_MANAGER = 0x749dF84Fd6DE7c0A67db3827e5118259ed3aBBa5;
    address private constant STAKING = 0x2666951A62d82860E8e1385581E2FB7669097647;

    IRewardsController rewardsControllerProxy;
    RewardsController rewardsControllerImpl;
    IERC20 rewardToken;

    function setUp() public {
        // Instantiate the contracts
        rewardsControllerProxy = IRewardsController(REWARDS_CONTROLLER_PROXY);
        rewardsControllerImpl = new RewardsController(EMISSIONS_MANAGER, STAKING);

        rewardToken = IERC20(ERC20_TOKEN);

        // Impersonate the user
        vm.startPrank(ADMIN_MULTISIG);

        // Deploy Local version and upgrade the proxy
        rewardsControllerProxy.upgradeTo(address(rewardsControllerImpl));

        // Stop the prank
        vm.stopPrank();

        // Now impersonate the user
        vm.startPrank(IMPERSONATED_USER);
    }

    function testClaimsAndGetter() public {
        address[] memory assets = new address[](4);
        assets[0] = 0xa2703Dc9FbACCD6eC2e4CBfa700989D0238133f6;
        assets[1] = 0x476F206511a18C9956fc79726108a03E647A1817;
        assets[2] = 0x0684FC172a0B8e6A65cF4684eDb2082272fe9050;
        assets[3] = 0x8B6E58eA81679EeCd63468c6D4EAefA48A45868D;

        // Fetch all user rewards before claiming
        (, uint256[] memory unclaimedAmounts) =
            rewardsControllerProxy.getAllUserRewards(assets, IMPERSONATED_USER);

        // Calculate the total unclaimed rewards
        uint256 unclaimedRewards = 0;
        for (uint256 i = 0; i < unclaimedAmounts.length; i++) {
            unclaimedRewards += unclaimedAmounts[i];
        }

        // Fetch balances before
        uint256 balanceBefore = rewardToken.balanceOf(IMPERSONATED_USER);
        
        // Claim all rewards
        rewardsControllerProxy.claimAllRewards(assets, IMPERSONATED_USER);

        // Fetch all user rewards after claiming
        (, unclaimedAmounts) = rewardsControllerProxy.getAllUserRewards(assets, IMPERSONATED_USER);
        for (uint256 i = 0; i < unclaimedAmounts.length; i++) {
            assertEq(unclaimedAmounts[i], 0);
        }

        // Fetch balances after
        uint256 balanceAfter = rewardToken.balanceOf(IMPERSONATED_USER);

        // Assert that the balance has increased by the unclaimed rewards
        assertEq(balanceAfter, balanceBefore + unclaimedRewards);
    }
}
