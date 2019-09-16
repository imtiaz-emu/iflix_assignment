# prerequisites
nodeJS 
    --version 12.10.0 is preferred
# run program
``` 
sh bin/run
```
# run test
``` 
sh bin/test
```
# Solution
# steps:
```
1. read all partner files from `./data/` directory
2. for every partner store grants/revocations as an offer in a single offer array
3. sort all the offers from step 2 based on offer date
4. read all accounts from `./data/accounts.json` file. Create `User` Objects.
5. for each offer from step 2
    1. create a new `Offer` object, find user who is eligible for the offer and try to assign newly created offer to the user
    2. if user found
        2.1 if offer is "GRANT"
            2.1.1 whenever an offer comes, if it doesn't contain end date just skip the offer 
            2.1.2 check user currently occupies an offer from a partner, then check if newly incoming offer is coming from the same partner
            2.1.3 If user don't have any offer right now or, if new offer is not conflicting with the current offer then, just add the offer to user
            2.1.4 If user have an offer from any partner and the newly coming offer is from the same partner falls between user's current offer then, extend the offer. That means, current offers end date will be new offers start date + N months
        2.2 if offer is "REVOKE"
            2.2.1 check user holds any offer from the same partner similar to revoking offer's partner then, update the holding offer's end date to revoke offer's start date
6. For each user from step 4
    1. calculate all the subscription duration he is availing from different partners
7. write the result in the file '/output/result.json'
```

### Notes

First I tried to solve the problem as a naive, in brute force approach. You can see that approach on `lib/app.js` file. The solution does not work for every case. It was tracing offer using one single state variable. Also, it was hard to trace the errors. It was more like a POC.

The second approach is more object oriented and kind of a solution that can be applied in a real life scenario. The core difference is instead of having one single offer state, it now can hold multiple offers as array in the user object. This gives more flexibility in terms of managing all the subscriptions.

I'm a newbie in NOdeJS. I learned as much as possible to solve the solution in a modular way to deliver the solution within the given timeframe.

I found a mismatch with your expected output and my output. It's for user Olga. He has two individual offer from different partners which are not overlapping with each other. Means, after finishing the offer from Partner A, he received an offer from Partner B. So, he can have two separate offers which I handled in my solution. But in your expected_output it only showing the accepted offer from Partner A.  
